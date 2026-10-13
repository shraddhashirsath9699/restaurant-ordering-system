"""Admin-only routes: orders list/detail/status and dashboard numbers."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.api.orders import load_order_query, to_order_out
from app.db.database import get_db
from app.models import Customer, Order
from app.schemas.schemas import OrderOut, StatusUpdate
from app.services.order_service import CANCEL_STATUSES, check_new_status, today_start_ist

# Every route in this file needs a valid admin JWT
router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


@router.get("/orders", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = None,
    order_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = load_order_query(db).join(Customer, Order.customer_id == Customer.id)
    if status:
        query = query.filter(Order.status == status)
    if order_type:
        query = query.filter(Order.order_type == order_type)
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(Order.order_number.ilike(like), Customer.name.ilike(like), Customer.mobile.ilike(like))
        )
    orders = query.order_by(Order.created_at.desc()).all()
    return [to_order_out(order) for order in orders]


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order_detail(order_id: int, db: Session = Depends(get_db)):
    order = load_order_query(db).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(404, "Order not found")
    return to_order_out(order)


@router.put("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    order = load_order_query(db).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(404, "Order not found")

    check_new_status(order, data.status)
    order.status = data.status

    # Cash is collected when the order is finished
    if order.payment and data.status in ("Delivered", "Completed", "Served"):
        order.payment.status = "Paid"
    if order.payment and data.status in CANCEL_STATUSES:
        order.payment.status = "Cancelled"

    db.commit()
    return to_order_out(load_order_query(db).filter(Order.id == order_id).one())


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """Numbers for the admin dashboard cards."""
    start = today_start_ist()
    todays = db.query(Order).filter(Order.created_at >= start)

    def count(statuses):
        return todays.filter(Order.status.in_(statuses)).count()

    revenue = (
        todays.filter(Order.status.notin_(CANCEL_STATUSES))
        .with_entities(func.coalesce(func.sum(Order.total_amount), 0))
        .scalar()
    )
    return {
        "todays_orders": todays.count(),
        "pending_orders": count(["Order Placed", "Pending"]),
        "preparing_orders": count(["Accepted", "Preparing"]),
        "completed_orders": count(["Delivered", "Completed", "Served"]),
        "cancelled_orders": count(CANCEL_STATUSES),
        "todays_revenue": float(revenue),
    }
