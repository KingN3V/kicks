import re
import unicodedata

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product

MAX_BASE_LENGTH = 150  # slug column is 160, leaving room for a "-2", "-3" suffix


def slugify(text: str) -> str:
    """'Nike Air Max 90 (Kids)!' -> 'nike-air-max-90-kids'"""
    # Turn accented letters into plain ones (é -> e), drop anything non-ASCII
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    # Anything that isn't a letter or digit becomes a single hyphen
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text[:MAX_BASE_LENGTH].strip("-") or "product"


def unique_slug(db: Session, name: str) -> str:
    """Slugify the name, adding -2, -3, ... until no product already uses it."""
    base = slugify(name)
    slug = base
    n = 2
    while db.scalar(select(Product.id).where(Product.slug == slug)) is not None:
        slug = f"{base}-{n}"
        n += 1
    return slug