"""Fills the database with demo data. Run once:  python seed.py
Safe to run again: it only adds data if the tables are empty."""
from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.models import Admin, Category, MenuItem

ADMIN_EMAIL = "admin@spiceroute.com"
ADMIN_PASSWORD = "Admin@123"

IMG = "https://images.unsplash.com/"
CATEGORIES = [
    ("Starters", "Light bites to begin your meal"),
    ("Main Course", "Hearty curries, grills and more"),
    ("Pizza & Pasta", "Wood-fired pizzas and fresh pasta"),
    ("Desserts", "Sweet endings"),
    ("Beverages", "Fresh juices and shakes"),
]

# (category, name, description, price, image, is_veg, is_popular)
MENU = [
    ("Starters", "Paneer Tikka", "Smoky grilled cottage cheese with mint chutney.", 249, "photo-1567188040759-fb8a883dc6d8", True, True),
    ("Starters", "Chicken Seekh Kebab", "Minced chicken skewers grilled in a clay oven.", 299, "photo-1555939594-58d7cb561ad1", False, False),
    ("Starters", "Crispy Veg Spring Rolls", "Golden rolls stuffed with fresh vegetables.", 179, "photo-1540189549336-e6e99c3679fe", True, False),
    ("Main Course", "Butter Chicken", "Tender chicken in a rich creamy tomato gravy.", 349, "photo-1603894584373-5ac82b2ae398", False, True),
    ("Main Course", "Dal Makhani", "Slow-cooked black lentils finished with butter.", 229, "photo-1546833999-b9f581a1996d", True, False),
    ("Main Course", "Veg Biryani", "Fragrant basmati rice layered with vegetables.", 259, "photo-1512621776951-a57141f2eefd", True, True),
    ("Main Course", "Grilled Fish Platter", "Fresh fish grilled with herbs and lemon.", 449, "photo-1519708227418-c8fd9a32b7a2", False, False),
    ("Pizza & Pasta", "Margherita Pizza", "Classic tomato, mozzarella and fresh basil.", 299, "photo-1565299624946-b28f40a0ae38", True, True),
    ("Pizza & Pasta", "Pepperoni Pizza", "Loaded with spicy pepperoni and cheese.", 399, "photo-1628840042765-356cda07504e", False, False),
    ("Pizza & Pasta", "Creamy Alfredo Pasta", "Penne in a silky white sauce with herbs.", 279, "photo-1621996346565-e3dbc646d9a9", True, False),
    ("Desserts", "Chocolate Lava Cake", "Warm chocolate cake with a molten centre.", 169, "photo-1624353365286-3f8d62daad51", True, True),
    ("Desserts", "Gulab Jamun", "Soft milk dumplings soaked in rose syrup.", 119, "photo-1601303516534-bf4f7e7a2f65", True, False),
    ("Desserts", "Pancake Stack", "Fluffy pancakes with maple syrup and berries.", 199, "photo-1567620905732-2d1ec7ab7445", True, False),
    ("Beverages", "Fresh Lime Soda", "Sweet or salted, served chilled.", 89, "photo-1513558161293-cdaf765ed2fd", True, False),
    ("Beverages", "Mango Lassi", "Thick yogurt shake blended with ripe mangoes.", 129, "photo-1527661591475-527312dd65f5", True, False),
    ("Beverages", "Cold Coffee", "Iced coffee blended with cream.", 149, "photo-1461023058943-07fcbe16d735", True, False),
]


def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Admin).count() == 0:
            db.add(Admin(name="Restaurant Admin", email=ADMIN_EMAIL, password_hash=hash_password(ADMIN_PASSWORD)))
            print(f"Created admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

        if db.query(Category).count() == 0:
            for name, description in CATEGORIES:
                db.add(Category(name=name, description=description))
            db.commit()

            categories = {c.name: c.id for c in db.query(Category).all()}
            for category, name, description, price, image, is_veg, is_popular in MENU:
                db.add(
                    MenuItem(
                        category_id=categories[category],
                        name=name,
                        description=description,
                        price=price,
                        image_url=f"{IMG}{image}?auto=format&fit=crop&w=800&q=75",
                        is_veg=is_veg,
                        is_popular=is_popular,
                    )
                )
            print(f"Created {len(CATEGORIES)} categories and {len(MENU)} menu items")

        db.commit()
        print("Seed finished.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
