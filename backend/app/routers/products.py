from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Product, Variant
from app.schemas import ProductDetail, ProductPage

router = APIRouter(prefix="/products", tags=["products"])

# Load related rows up front
EAGER = (selectinload(Product.variants), selectinload(Product.images))


class FilterOptions(BaseModel):
    brands: list[str]
    categories: list[str]
    sizes: list[str]


def _size_key(size: str):
    # Numeric sizes first, in numeric order ("9" < "10" < "42.5"); anything else after
    try:
        return (0, float(size), size)
    except ValueError:
        return (1, 0.0, size)


@router.get("", response_model=ProductPage)
def list_products(
    db: Annotated[Session, Depends(get_db)],
    brand: str | None = None,
    category: str | None = None,
    size: str | None = None,
    min_price: Annotated[int | None, Query(ge=0)] = None,
    max_price: Annotated[int | None, Query(ge=0)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 12,
):
    stmt = select(Product).where(Product.is_visible.is_(True))

    if brand:
        stmt = stmt.where(func.lower(Product.brand) == brand.lower())
    if category:
        stmt = stmt.where(func.lower(Product.category) == category.lower())
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if size:
        # has this size at all (in stock or not)
        stmt = stmt.where(Product.variants.any(Variant.size == size))

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))

    stmt = (
        stmt.options(*EAGER)
        .order_by(Product.created_at.desc(), Product.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = db.scalars(stmt).all()

    return ProductPage(items=items, total=total, page=page, page_size=page_size)


# MUST stay above "/{slug}", or "filters" would be read as a product slug.
@router.get("/filters", response_model=FilterOptions)
def get_filters(db: Annotated[Session, Depends(get_db)]):
    """Distinct values for the catalog filter dropdowns (visible products only)."""
    visible = Product.is_visible.is_(True)

    brands = db.scalars(
        select(Product.brand)
        .where(visible, Product.brand.is_not(None), Product.brand != "")
        .distinct()
        .order_by(Product.brand)
    ).all()

    categories = db.scalars(
        select(Product.category)
        .where(visible, Product.category.is_not(None), Product.category != "")
        .distinct()
        .order_by(Product.category)
    ).all()

    sizes = db.scalars(
        select(Variant.size)
        .join(Product, Variant.product_id == Product.id)
        .where(visible)
        .distinct()
    ).all()

    return FilterOptions(
        brands=list(brands),
        categories=list(categories),
        sizes=sorted(sizes, key=_size_key),
    )


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: Annotated[Session, Depends(get_db)]):
    stmt = (
        select(Product)
        .where(Product.slug == slug, Product.is_visible.is_(True))
        .options(*EAGER)
    )
    product = db.scalars(stmt).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product