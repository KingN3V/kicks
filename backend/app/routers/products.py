from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Product, Variant
from app.schemas import ProductDetail, ProductPage

router = APIRouter(prefix="/products", tags=["products"])

# Load related rows up front
EAGER = (selectinload(Product.variants), selectinload(Product.images))


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