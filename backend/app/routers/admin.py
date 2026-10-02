from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, ProductImage, Variant
from app.routers.auth import get_current_admin
from app.schemas import ProductDetail
from app.schemas_admin import ProductCreate, ProductUpdate, StockUpdate
from app.slugs import unique_slug

# The guard is on the router, so EVERY route added here is admin-only.
# You can't forget it on a new endpoint.
router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.post(
    "/products", response_model=ProductDetail, status_code=status.HTTP_201_CREATED
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
NOT_NULLABLE = {"name", "price", "is_visible"}


def get_product_or_404(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/products/{product_id}", response_model=ProductDetail)
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

    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}/variants/{size}", response_model=ProductDetail)
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