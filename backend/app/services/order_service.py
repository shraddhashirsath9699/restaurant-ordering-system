"""Order business logic: price calculation, order numbers and status rules."""
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from zoneinfo import ZoneInfo

from fastapi import HTTPException

from app.core.config import DELIVERY_CHARGE, FREE_DELIVERY_ABOVE, TAX_PERCENT

# The steps each order type goes through
DELIVERY_FLOW = ["Order Placed", "Pending", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered"]
TAKEAWAY_FLOW = ["Order Placed", "Accepted", "Preparing", "Ready for Pickup", "Completed"]
DINE_IN_FLOW = ["Order Placed", "Accepted", "Preparing", "Ready", "Served"]

CANCEL_STATUSES = ["Cancelled", "Rejected"]
FINAL_STATUSES = ["Delivered", "Completed", "Served", "Cancelled", "Rejected"]


def get_status_flow(order_type: str) -> list:
    if order_type == "Delivery":
        return DELIVERY_FLOW
    if order_type == "Takeaway":
        return TAKEAWAY_FLOW
    return DINE_IN_FLOW


def money(value) -> Decimal:
    """Round to 2 decimal places (like rupees and paise)."""
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_totals(subtotal: Decimal, order_type: str) -> dict:
    """Tax, delivery charge and grand total, all calculated on the server."""
    tax = money(subtotal * Decimal(TAX_PERCENT) / Decimal(100))
    delivery_charge = Decimal("0.00")
    if order_type == "Delivery" and subtotal < FREE_DELIVERY_ABOVE:
        delivery_charge = money(DELIVERY_CHARGE)
    discount = Decimal("0.00")  # coupons are a bonus feature, not implemented
    total = money(subtotal + tax + delivery_charge - discount)
    return {"tax": tax, "delivery_charge": delivery_charge, "discount": discount, "total": total}


def make_order_number(order_id: int) -> str:
    """Example: ORD-2026-000125 (year + order id padded to 6 digits)."""
    return f"ORD-{datetime.now().year}-{order_id:06d}"


def check_new_status(order, new_status: str):
    """Make sure the admin is making a valid status change. Raises HTTP 400 if not."""
    if order.status in FINAL_STATUSES:
        raise HTTPException(400, f"This order is already {order.status} and cannot be changed")

    if new_status in CANCEL_STATUSES:
        return

    flow = get_status_flow(order.order_type)
    if new_status not in flow:
        raise HTTPException(400, f"'{new_status}' is not a valid status for a {order.order_type} order")
    if flow.index(new_status) <= flow.index(order.status):
        raise HTTPException(400, "Order status can only move forward")


def today_start_ist() -> datetime:
    """Midnight today in India time (used for the dashboard 'today' numbers)."""
    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    return now.replace(hour=0, minute=0, second=0, microsecond=0)
