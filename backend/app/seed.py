from app.database import SessionLocal
from app.models import Product, ProductImage, Variant


def run():
    with SessionLocal() as db:
        if db.query(Product).first():
            print("Products already exist, skipping")
            return
        db.add_all([
            Product(
                name="Air Force 1 Low", slug="air-force-1-low", brand="Nike",
                category="Sneakers", price=9500, description="Classic white.",
                variants=[Variant(size="41", stock=2), Variant(size="42", stock=0),
                          Variant(size="43", stock=1)],
                images=[ProductImage(url="https://example.com/af1-1.jpg", position=0)],
            ),
            Product(
                name="Samba OG", slug="samba-og", brand="Adidas",
                category="Sneakers", price=12000,
                variants=[Variant(size="40", stock=0), Variant(size="42", stock=0)],
                images=[ProductImage(url="https://example.com/samba-1.jpg", position=0)],
            ),
            Product(
                name="Hidden Test Shoe", slug="hidden-test", brand="Puma",
                category="Boots", price=7000, is_visible=False,
                variants=[Variant(size="44", stock=5)],
            ),
        ])
        db.commit()
        print("Seeded")


if __name__ == "__main__":
    run()