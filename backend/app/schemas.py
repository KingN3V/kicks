from pydantic import BaseModel, ConfigDict


class VariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    size: str
    stock: int


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int      # new
    url: str
    position: int


class ProductListItem(BaseModel):
    """Lightweight shape for the catalog grid."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    brand: str | None
    category: str | None
    price: int
    sold_out: bool
    cover_image: str | None
    variants: list[VariantOut]   # new


class ProductDetail(ProductListItem):
    """Full shape for the product page (inherits the list fields)."""
    description: str | None
    images: list[ImageOut]
    


class ProductPage(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    page_size: int