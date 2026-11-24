from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ArtworkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    artist: str
    category: str
    medium: str
    description: str
    image_url: str
    price: float
    width_cm: int
    height_cm: int
    is_featured: bool


class OrderLineIn(BaseModel):
    artwork_id: int
    quantity: int = Field(ge=1, le=20)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=40)
    address: str = Field(min_length=8, max_length=500)
    city: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=3, max_length=20)
    note: str | None = Field(default=None, max_length=1000)
    items: list[OrderLineIn] = Field(min_length=1, max_length=30)


class OrderOut(BaseModel):
    order_number: str
    status: str
    total: float
    created_at: datetime
