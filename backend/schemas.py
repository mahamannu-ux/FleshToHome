from pydantic import BaseModel
from typing import List, Optional

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    weight_unit: str
    image_url: str
    stock_quantity: int


class Product(ProductBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True


class Category(BaseModel):
    id: int
    name: str
    image_url: str
    products: List[Product] = []

    class Config:
        from_attributes = True


# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


# --- Order Schemas ---
class OrderCreate(BaseModel):
    user_id: int
    total_price: float


class Order(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
