from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel, Field
from app.images import upload_product_image
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, select, update


from app.database import get_db
from app.models import Product, ProductImage, Variant
from app.routers.auth import get_current_admin
from app.schemas_admin import ProductCreate, ProductUpdate, StockUpdate, AdminProductDetail, AdminProductPage
from app.slugs import unique_slug
from app.routers.products import EAGER


# The guard is on the router, so EVERY route added here is admin-only.
# You can't forget it on a new endpoint.
router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.post(
    "/products", response_model=AdminProductDetail , status_code=status.HTTP_201_CREATED
)
def create_product(data: ProductCreate, db: Annotated[Session, Depends(get_db)]):
    sizes = [v.size for v in data.variants]
    if len(sizes) != len(set(sizes)):
        raise HTTPException(status_code=422, detail="Duplicate sizes in variants")

    product = Product(
        name=data.name,
        slug=unique_slug(db, data.name),
        brand=data.brand,
        category=data.category,
        description=data.description,
        price=data.price,
        is_visible=data.is_visible,
        variants=[Variant(**v.model_dump()) for v in data.variants],
        images=[ProductImage(**i.model_dump()) for i in data.images],
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# Fields that are NOT NULL in the database: a client may omit them, but not null them
NOT_NULLABLE = {"name", "price", "is_visible", "is_featured"}


def get_product_or_404(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/products/{product_id}", response_model=AdminProductDetail )
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    product = get_product_or_404(db, product_id)

    # Only the fields the client actually sent
    changes = data.model_dump(exclude_unset=True)
    for field, value in changes.items():
        if value is None and field in NOT_NULLABLE:
            raise HTTPException(status_code=422, detail=f"{field} cannot be null")
        setattr(product, field, value)
    
    # Only one shoe can be featured: if this one was just featured, un-feature
    # every other shoe. Same transaction as the change above, so it all
    # succeeds or none of it does.
    if changes.get("is_featured") is True:
        db.execute(
            update(Product)
            .where(Product.id != product.id, Product.is_featured.is_(True))
            .values(is_featured=False)
        )

    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}/variants/{size}", response_model=AdminProductDetail )
def set_stock(
    product_id: int,
    size: str,
    data: StockUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Set the stock for one size. Creates the size if the product doesn't have it yet."""
    product = get_product_or_404(db, product_id)

    variant = next((v for v in product.variants if v.size == size), None)
    if variant is None:
        product.variants.append(Variant(size=size, stock=data.stock))
    else:
        variant.stock = data.stock

    db.commit()
    db.refresh(product)
    return product


class UploadOut(BaseModel):
    url: str
    public_id: str


@router.post("/uploads", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
def upload_image(file: Annotated[UploadFile, File()]):
    """Upload one image to Cloudinary and get back its URL."""
    return upload_product_image(file)



class ImageAdd(BaseModel):
    url: str = Field(min_length=1, max_length=500)


class ImageOrder(BaseModel):
    image_ids: list[int]


@router.post(
    "/products/{product_id}/images",
    response_model=AdminProductDetail ,
    status_code=status.HTTP_201_CREATED,
)
def add_image(
    product_id: int,
    data: ImageAdd,
    db: Annotated[Session, Depends(get_db)],
):
    """Attach an already-uploaded image URL to a product (goes to the end)."""
    product = get_product_or_404(db, product_id)

    next_position = max((i.position for i in product.images), default=-1) + 1
    product.images.append(ProductImage(url=data.url, position=next_position))

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}/images/{image_id}", response_model=AdminProductDetail )
def delete_image(
    product_id: int,
    image_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    product = get_product_or_404(db, product_id)

    image = next((i for i in product.images if i.id == image_id), None)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found on this product")

    product.images.remove(image)  # delete-orphan cascade deletes the row

    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}/images/order", response_model=AdminProductDetail )
def reorder_images(
    product_id: int,
    data: ImageOrder,
    db: Annotated[Session, Depends(get_db)],
):
    """Send every image id in the order you want. The first one becomes the cover."""
    product = get_product_or_404(db, product_id)

    current = {i.id: i for i in product.images}
    if sorted(data.image_ids) != sorted(current):
        raise HTTPException(
            status_code=422,
            detail="image_ids must list every image of this product exactly once",
        )

    for position, image_id in enumerate(data.image_ids):
        current[image_id].position = position

    db.commit()
    db.refresh(product)
    return product


@router.get("/products", response_model=AdminProductPage)
def admin_list_products(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    is_visible: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    """Every product, hidden ones included. Optional name/brand search."""
    stmt = select(Product)

    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(Product.name.ilike(pattern), Product.brand.ilike(pattern))
        )
    if is_visible is not None:
        stmt = stmt.where(Product.is_visible.is_(is_visible))

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))

    stmt = (
        stmt.options(*EAGER)
        .order_by(Product.created_at.desc(), Product.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = db.scalars(stmt).all()

    return AdminProductPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/products/{product_id}", response_model=AdminProductDetail)
def admin_get_product(
    product_id: int, db: Annotated[Session, Depends(get_db)]
):
    return get_product_or_404(db, product_id)