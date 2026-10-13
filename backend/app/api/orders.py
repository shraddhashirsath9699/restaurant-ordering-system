"""Customer order routes: POST /api/orders and GET /api/orders/{id}."""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models import Customer, MenuItem, Order, OrderItem, Payment
from app.schemas.schemas import OrderCreate, OrderOut
from app.services.order_service import calculate_totals, get_status_flow, make_order_number, money

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def to_order_out(order: Order) -> OrderOut:
    """Convert an Order row (with its customer, items, payment) into the response."""
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        order_type=order.order_type,
        status=order.status,
        customer_name=order.customer.name,
        mobile=order.customer.mobile,
        email=order.customer.email,
        address=order.address,
        city=order.city,
        pincode=order.pincode,
        landmark=order.landmark,
        table_number=order.table_number,
        notes=order.notes,
        subtotal=float(order.subtotal),
        tax=float(order.tax),
        delivery_charge=float(order.delivery_charge),
        discount=float(order.discount),
        total_amount=float(order.total_amount),
        payment_method=order.payment.method if order.payment else None,
        payment_status=order.payment.status if order.payment else None,
        created_at=order.created_at,
        items=[
            {
                "menu_item_id": i.menu_item_id,
                "item_name": i.item_name,
                "unit_price": float(i.unit_price),
                "quantity": i.quantity,
                "line_total": float(i.line_total),
            }
            for i in order.items
        ],
        status_flow=get_status_flow(order.order_type),
    )


def load_order_query(db: Session):
    return db.query(Order).options(
        joinedload(Order.customer), joinedload(Order.items), joinedload(Order.payment)
    )


@router.post("", response_model=OrderOut, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    # Step 1-4: for each cart line, read the REAL price from the database
    subtotal = Decimal("0.00")
    order_items = []
    for line in data.items:
        menu_item = db.get(MenuItem, line.menu_item_id)
        if menu_item is None:
            raise HTTPException(400, f"Menu item {line.menu_item_id} does not exist")
        if not menu_item.is_available:
            raise HTTPException(400, f"Sorry, '{menu_item.name}' is currently unavailable")

        line_total = money(menu_item.price * line.quantity)
        subtotal += line_total
        order_items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                item_name=menu_item.name,
                unit_price=menu_item.price,
                quantity=line.quantity,
                line_total=line_total,
            )
        )

    # Step 5-6: tax, delivery and the final total
    totals = calculate_totals(subtotal, data.order_type)

    # Find the customer by mobile or create a new one
    customer = db.query(Customer).filter(Customer.mobile == data.mobile).first()
    if customer is None:
        customer = Customer(name=data.customer_name, mobile=data.mobile, email=data.email)
        db.add(customer)
        db.flush()  # gives the customer an id without finishing the transaction
    else:
        customer.name = data.customer_name
        if data.email:
            customer.email = data.email

    # Step 7: create the order, its items and a payment record
    is_delivery = data.order_type == "Delivery"
    order = Order(
        customer_id=customer.id,
        order_type=data.order_type,
        status="Order Placed",
        address=data.address if is_delivery else None,
        city=data.city if is_delivery else None,
        pincode=data.pincode if is_delivery else None,
        landmark=data.landmark if is_delivery else None,
        table_number=data.table_number if data.order_type == "Dine-in" else None,
        notes=data.notes,
        subtotal=subtotal,
        tax=totals["tax"],
        delivery_charge=totals["delivery_charge"],
        discount=totals["discount"],
        total_amount=totals["total"],
        items=order_items,
    )
    db.add(order)
    db.flush()  # now the order has an id
    order.order_number = make_order_number(order.id)
    order.payment = Payment(method="Cash", status="Pending", amount=totals["total"])
    db.commit()

    return to_order_out(load_order_query(db).filter(Order.id == order.id).one())


@router.get("/{order_ref}", response_model=OrderOut)
def get_order(order_ref: str, mobile: str, db: Session = Depends(get_db)):
    """Track an order. order_ref can be the id (125) or the order number (ORD-2026-000125).
    The customer's mobile number must match, so strangers cannot read other people's orders."""
    query = load_order_query(db)
    if order_ref.isdigit():
        order = query.filter(Order.id == int(order_ref)).first()
    else:
        order = query.filter(Order.order_number == order_ref.upper()).first()

    if order is None or order.customer.mobile != mobile.strip():
        raise HTTPException(404, "Order not found. Check the order number and mobile number")
    return to_order_out(order)
