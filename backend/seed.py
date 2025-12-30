from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
import backend.models

# 1. Create the database tables
backend.models.Base.metadata.create_all(bind=engine)


def seed_data():

    db: Session = SessionLocal()

    # 2. Define Categories
    categories_names = ["Seafood", "Chicken", "Mutton", "Steaks"]

    categories_image_urls = [
        "static/images/seafood/seafood1.png",
        "static/images/chicken/chicken1.png",
        "static/images/mutton/mutton1.png",
        "static/images/steak/steak4.png",
    ]
    cat_map = {}

    for name in categories_names:
        existing = (
            db.query(backend.models.Category)
            .filter(backend.models.Category.name == name)
            .first()
        )
        if not existing:
            new_cat = backend.models.Category(
                name=name, image_url=categories_image_urls[categories_names.index(name)]
            )
            db.add(new_cat)
            db.commit()
            db.refresh(new_cat)
            cat_map[name] = new_cat
        else:
            cat_map[name] = existing

    # 3. Define Catalog Items (5 examples per category to start)
    catalog = {
        "Seafood": [
            {
                "name": "Atlantic Salmon Fillet",
                "price": 25,
                "unit": "500g",
                "desc": "Fresh, skin-on salmon.",
                "image_url": "static/images/seafood/seafood1.png",
            },
            {
                "name": "Tiger Prawns (Jumbo)",
                "price": 18,
                "unit": "1kg",
                "desc": "Cleaned and deveined.",
                "image_url": "static/images/seafood/seafood2.png",
            },
            {
                "name": "Sea Bass",
                "price": 12,
                "unit": "500g",
                "desc": "Whole cleaned Mediterranean sea bass.",
                "image_url": "static/images/seafood/seafood2.png",
            },
            {
                "name": "Mud Crabs",
                "price": 30,
                "unit": "1kg",
                "desc": "Live caught, meaty mud crabs.",
                "image_url": "static/images/seafood/seafood3.png",
            },
            {
                "name": "Calamari Rings",
                "price": 10,
                "unit": "500g",
                "desc": "Tender squid rings for frying.",
                "image_url": "static/images/seafood/seafood4.png",
            },
        ],
        "Chicken": [
            {
                "name": "Organic Chicken Breast",
                "price": 10,
                "unit": "500g",
                "desc": "Boneless and skinless.",
                "image_url": "static/images/chicken/chicken1.png",
            },
            {
                "name": "Chicken Drumsticks",
                "price": 6,
                "unit": "1kg",
                "desc": "Perfect for baking or frying.",
                "image_url": "static/images/chicken/chicken2.png",
            },
            {
                "name": "Whole Farm Chicken",
                "price": 14,
                "unit": "1.2kg",
                "desc": "Fresh, antibiotic-free.",
                "image_url": "static/images/chicken/chicken3.png",
            },
            {
                "name": "Chicken Wings",
                "price": 7,
                "unit": "1kg",
                "desc": "Party-sized succulent wings.",
                "image_url": "static/images/chicken/chicken4.png",
            },
            {
                "name": "Chicken Mince",
                "price": 8,
                "unit": "500g",
                "desc": "Extra lean ground chicken.",
                "image_url": "static/images/chicken/chicken5.png",
            },
        ],
        "Mutton": [
            {
                "name": "Mutton Curry Cut",
                "price": 15,
                "unit": "500g",
                "desc": "Bone-in pieces for rich curries.",
                "image_url": "static/images/mutton/mutton1.png",
            },
            {
                "name": "Boneless Lamb",
                "price": 22,
                "unit": "500g",
                "desc": "Tender cubes for kebabs.",
                "image_url": "static/images/mutton/mutton2.png",
            },
            {
                "name": "Lamb Chops",
                "price": 28,
                "unit": "1kg",
                "desc": "Premium cut rib chops.",
                "image_url": "static/images/mutton/mutton3.png",
            },
            {
                "name": "Mutton Keema",
                "price": 16,
                "unit": "500g",
                "desc": "Fine ground goat meat.",
                "image_url": "static/images/mutton/mutton4.png",
            },
            {
                "name": "Lamb Shank",
                "price": 19,
                "unit": "2 pcs",
                "desc": "Ideal for slow braising.",
                "image_url": "static/images/mutton/mutton5.png",
            },
        ],
        "Steaks": [
            {
                "name": "Wagyu Ribeye",
                "price": 55,
                "unit": "300g",
                "desc": "High marbling, melt-in-mouth.",
                "image_url": "static/images/steak/steak1.png",
            },
            {
                "name": "Filet Mignon",
                "price": 45,
                "unit": "250g",
                "desc": "The most tender cut available.",
                "image_url": "static/images/steak/steak2.png",
            },
            {
                "name": "New York Strip",
                "price": 35,
                "unit": "400g",
                "desc": "Bold flavor and great texture.",
                "image_url": "static/images/steak/steak3.png",
            },
            {
                "name": "T-Bone Steak",
                "price": 40,
                "unit": "500g",
                "desc": "The best of both worlds.",
                "image_url": "static/images/steak/steak4.png",
            },
            {
                "name": "Sirloin Steak",
                "price": 25,
                "unit": "300g",
                "desc": "Lean and flavorful classic cut.",
                "image_url": "static/images/steak/steak5.png",
            },
        ],
    }

    # 4. Add to Database
    for cat_name, items in catalog.items():
        for item in items:
            # Check if product exists to avoid double-seeding
            exists = (
                db.query(backend.models.Product)
                .filter(backend.models.Product.name == item["name"])
                .first()
            )
            if not exists:
                product = backend.models.Product(
                    name=item["name"],
                    price=item["price"],
                    weight_unit=item["unit"],
                    description=item["desc"],
                    image_url=item["image_url"],
                    category_id=cat_map[cat_name].id,
                    stock_quantity=100,  # Default stock
                )
                db.add(product)

    db.commit()
    print("✅ Database successfully seeded with catalog items!")
    db.close()


if __name__ == "__main__":
    seed_data()
