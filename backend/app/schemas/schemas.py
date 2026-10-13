"""Pydantic schemas: they validate the data coming IN and shape the data going OUT."""
import re
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_name: str


# ---------- Categories ----------
class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=255)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value):
        return value.strip()


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = None


# ---------- Menu ----------
class MenuItemIn(BaseModel):
    category_id: int
    name: str = Field(min_length=2, max_length=120)
    description: Optional[str] = None
    price: float = Field(gt=0, le=100000)
    image_url: Optional[str] = Field(default=None, max_length=500)
    is_veg: bool = True
    is_available: bool = True
    is_popular: bool = False


class MenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category_id: int
    category_name: str
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_veg: bool
    is_available: bool
    is_popular: bool


# ---------- Orders ----------
class OrderItemIn(BaseModel):
    menu_item_id: int
    quantity: int = Field(ge=1, le=20)  # note: NO price here - backend reads it from the DB


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    mobile: str
    email: Optional[str] = None
    order_type: Literal["Delivery", "Takeaway", "Dine-in"]
    address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=80)
    pincode: Optional[str] = None
    landmark: Optional[str] = Field(default=None, max_length=120)
    table_number: Optional[str] = Field(default=None, max_length=10)
    notes: Optional[str] = Field(default=None, max_length=255)
    items: List[OrderItemIn] = Field(min_length=1)

    @field_validator("mobile")
    @classmethod
    def check_mobile(cls, value):
        if not re.fullmatch(r"[6-9]\d{9}", value.strip()):
            raise ValueError("Enter a valid 10-digit mobile number")
        return value.strip()

    @field_validator("email")
    @classmethod
    def check_email(cls, value):
        if value is None or value.strip() == "":
            return None
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value.strip()):
            raise ValueError("Enter a valid email address")
        return value.strip()

    @model_validator(mode="after")
    def check_order_type_fields(self):
        if self.order_type == "Delivery":
            if not self.address or not self.city or not self.pincode:
                raise ValueError("Address, city and pincode are required for Delivery")
            if not re.fullmatch(r"\d{6}", self.pincode.strip()):
                raise ValueError("Pincode must be 6 digits")
        if self.order_type == "Dine-in" and not self.table_number:
            raise ValueError("Table number is required for Dine-in")
        return self


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    menu_item_id: int
    item_name: str
    unit_price: float
    quantity: int
    line_total: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    order_type: str
    status: str
    customer_name: str
    mobile: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    landmark: Optional[str] = None
    table_number: Optional[str] = None
    notes: Optional[str] = None
    subtotal: float
    tax: float
    delivery_charge: float
    discount: float
    total_amount: float
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut]
    status_flow: List[str]  # the steps this order will go through (for the tracking UI)


class StatusUpdate(BaseModel):
    status: str
