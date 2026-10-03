from pydantic import BaseModel, Field
from app.schemas import ProductDetail, ProductListItem


class VariantIn(BaseModel):
    size: str = Field(min_length=1, max_length=10)  # string so "42.5" works
    stock: int = Field(default=0, ge=0)


class ImageIn(BaseModel):
    url: str = Field(min_length=1, max_length=500)
    position: int = Field(default=0, ge=0)


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    brand: str | None = Field(default=None, max_length=80)
    category: str | None = Field(default=None, max_length=80)
    description: str | None = None
    price: int = Field(gt=0)  # whole KES
    is_visible: bool = True
    variants: list[VariantIn] = []
    images: list[ImageIn] = []


class ProductUpdate(BaseModel):
    """Every field optional: send only what you want to change (PATCH)."""
    name: str | None = Field(default=None, min_length=1, max_length=150)
    brand: str | None = Field(default=None, max_length=80)
    category: str | None = Field(default=None, max_length=80)
    description: str | None = None
    price: int | None = Field(default=None, gt=0)
    is_visible: bool | None = None


class StockUpdate(BaseModel):
    stock: int = Field(ge=0)


class AdminProductListItem(ProductListItem):
    is_visible: bool


class AdminProductDetail(ProductDetail):
    is_visible: bool


class AdminProductPage(BaseModel):
    items: list[AdminProductListItem]
    total: int
    page: int
    page_size: int