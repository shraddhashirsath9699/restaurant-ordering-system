"""All database tables (7 tables)."""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, CheckConstraint, Column, DateTime, ForeignKey, Integer, Numeric, String, Text,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


def now_utc():
    return datetime.now(timezone.utc)


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)  # never the plain password
    created_at = Column(DateTime(timezone=True), default=now_utc)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(15), nullable=False, index=True)
    email = Column(String(150))
    created_at = Column(DateTime(timezone=True), default=now_utc)

    orders = relationship("Order", back_populates="customer")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=now_utc)

    menu_items = relationship("MenuItem", back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"
    __table_args__ = (CheckConstraint("price > 0", name="price_must_be_positive"),)

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500))
    is_veg = Column(Boolean, default=True, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    is_popular = Column(Boolean, default=False, nullable=False)  # shown in "Signature dishes"
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    category = relationship("Category", back_populates="menu_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    order_number = Column(String(30), unique=True, index=True)  # e.g. ORD-2026-000125
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    order_type = Column(String(20), nullable=False)  # Delivery / Takeaway / Dine-in
    status = Column(String(30), nullable=False, default="Order Placed", index=True)

    # Delivery details (only for Delivery orders)
    address = Column(String(255))
    city = Column(String(80))
    pincode = Column(String(10))
    landmark = Column(String(120))
    # Dine-in detail
    table_number = Column(String(10))
    notes = Column(String(255))

    subtotal = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), nullable=False)
    delivery_charge = Column(Numeric(10, 2), nullable=False, default=0)
    discount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)

    created_at = Column(DateTime(timezone=True), default=now_utc, index=True)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    item_name = Column(String(120), nullable=False)  # saved copy, in case the menu changes later
    unit_price = Column(Numeric(10, 2), nullable=False)  # price from DATABASE at order time
    quantity = Column(Integer, nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    method = Column(String(30), nullable=False, default="Cash")  # Cash on delivery / at counter
    status = Column(String(20), nullable=False, default="Pending")  # Pending / Paid
    amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    order = relationship("Order", back_populates="payment")
