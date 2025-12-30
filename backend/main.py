from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import models, schemas
from database import engine, get_db, SessionLocal
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import seed

# ... (your other imports like models, get_db, etc.)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)

    # 2. Check if DB is empty and seed it
    db = SessionLocal()
    try:
        # Check if any products exist
        if not db.query(models.Product).first():
            print("Database empty. Running seed logic...")
            seed.seed_data()  # Wrap seed.py logic in a function
    finally:
        db.close()

    yield
    # Cleanup logic (if any) goes here


app = FastAPI(title="Flesh To Home", lifespan=lifespan)


# Create the directory if it doesn't exist
if not os.path.exists("static/images"):
    os.makedirs("static/images")

# Mount the static files directory
# This allows the frontend to access images via /static
app.mount("/static", StaticFiles(directory="static"), name="static")

# Example of how your Product model/schema should store the path:
# image_url: "static/images/seer_fish.jpg"


# Allow the React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/products/search")
def search_products(q: str = "", db: Session = Depends(get_db)):
    """
    Searches for products where the name contains the search term 'q'.
    The 'ilike' makes it case-insensitive.
    """
    print(f"v2 Searching for products with term: {q}")
    if not q:
        return []

    # This looks for the string anywhere in the product name
    results = db.query(models.Product).filter(models.Product.name.ilike(f"%{q}%")).all()

    return results


# 1. Get all categories (for the Home Page grid)
@app.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


# 2. Get products by category (for the Catalog Page)
@app.get("/categories/{category_id}/products", response_model=List[schemas.Product])
def get_products_by_category(category_id: int, db: Session = Depends(get_db)):
    products = (
        db.query(models.Product)
        .filter(models.Product.category_id == category_id)
        .limit(20)
        .all()
    )
    return products


# 3. Get a single product detail
@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Add these imports at the top


# --- AUTHENTICATION ---


class LoginRequest(BaseModel):
    phone_number: str


class VerifyRequest(BaseModel):
    phone_number: str
    otp: str


@app.post("/auth/send-otp")
def send_otp(request: LoginRequest):
    if not request.phone_number.isdigit() or len(request.phone_number) != 10:
        raise HTTPException(status_code=400, detail="Invalid Indian phone number")
    print(f"DEBUG: Sending OTP 1234 to {request.phone_number}")
    return {"message": "OTP sent successfully"}


@app.post("/auth/verify-otp")
def verify_otp(request: VerifyRequest, db: Session = Depends(get_db)):
    if request.otp == "1234":  # Our test OTP
        # 1. Search for existing user
        user = (
            db.query(models.User)
            .filter(models.User.phone == request.phone_number)
            .first()
        )

        # 2. If not found, create new user (Registration)
        if not user:
            user = models.User(
                phone=request.phone_number, name="Guest User", address="", email=""
            )
            db.add(user)
            db.commit()
            db.refresh(user)  # This populates user.id from the DB

        # 3. Return the REAL database object
        return {
            "status": "success",
            "user": {
                "id": user.id,
                "phone": user.phone,
                "name": user.name,
                "address": user.address,
                "email": user.email,
            },
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")


# --- USER PROFILE ---


@app.put("/users/{user_id}")
def update_user(user_id: int, updated_data: dict, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields if they exist in the request
    db_user.name = updated_data.get("name", db_user.name)
    db_user.email = updated_data.get("email", db_user.email)
    db_user.address = updated_data.get("address", db_user.address)

    db.commit()
    db.refresh(db_user)
    return db_user


# --- ORDERS ---


@app.post("/orders")
def place_order(order_data: dict, db: Session = Depends(get_db)):
    try:
        # Debug: Print exactly what the backend received
        print(f"Received Order Data: {order_data}")

        # Use .get() to avoid the 'user_id' KeyError crash
        uid = order_data.get("user_id")
        total = order_data.get("total_price")

        if not uid:
            raise HTTPException(status_code=400, detail="Missing user_id in request")

        new_order = models.Order(user_id=uid, total_price=total, status="Pending")
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return {"message": "Order placed successfully!", "id": new_order.id}

    except Exception as e:
        print(f"BACKEND CRASH: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/orders/user/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return orders


@app.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, data: dict, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.get("status")
    db.commit()
    return {"message": "Status updated"}
