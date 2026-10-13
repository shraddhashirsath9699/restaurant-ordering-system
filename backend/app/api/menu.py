"""Menu routes. GET is public; POST/PUT/DELETE need an admin JWT."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.db.database import get_db
from app.models import Category, MenuItem, OrderItem
from app.schemas.schemas import MenuItemIn, MenuItemOut

router = APIRouter(prefix="/api/menu", tags=["Menu"])


def to_menu_out(item: MenuItem) -> MenuItemOut:
    """Convert a database row into the response shape (adds category_name)."""
    return MenuItemOut(
        id=item.id,
        category_id=item.category_id,
        category_name=item.category.name,
        name=item.name,
        description=item.description,
        price=float(item.price),
        image_url=item.image_url,
        is_veg=item.is_veg,
        is_available=item.is_available,
        is_popular=item.is_popular,
    )


@router.get("", response_model=List[MenuItemOut])
def list_menu(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    popular: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(MenuItem).options(joinedload(MenuItem.category))
    if search:
        query = query.filter(MenuItem.name.ilike(f"%{search.strip()}%"))
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    if popular:
        query = query.filter(MenuItem.is_popular == True)  # noqa: E712
    items = query.order_by(MenuItem.id).all()
    return [to_menu_out(item) for item in items]


@router.get("/{item_id}", response_model=MenuItemOut)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if item is None:
        raise HTTPException(404, "Menu item not found")
    return to_menu_out(item)


@router.post("", response_model=MenuItemOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_menu_item(data: MenuItemIn, db: Session = Depends(get_db)):
    if db.get(Category, data.category_id) is None:
        raise HTTPException(400, "Selected category does not exist")

    item = MenuItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return to_menu_out(item)


@router.put("/{item_id}", response_model=MenuItemOut, dependencies=[Depends(get_current_admin)])
def update_menu_item(item_id: int, data: MenuItemIn, db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if item is None:
        raise HTTPException(404, "Menu item not found")
    if db.get(Category, data.category_id) is None:
        raise HTTPException(400, "Selected category does not exist")

    for field, value in data.model_dump().items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return to_menu_out(item)


@router.delete("/{item_id}", dependencies=[Depends(get_current_admin)])
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if item is None:
        raise HTTPException(404, "Menu item not found")

    # Old orders point to this item, so we cannot delete it. Disable it instead.
    used = db.query(OrderItem).filter(OrderItem.menu_item_id == item_id).first()
    if used:
        raise HTTPException(400, "This item is part of past orders. Disable it instead of deleting")

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted"}
