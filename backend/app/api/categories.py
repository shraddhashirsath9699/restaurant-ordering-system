"""Category routes. GET is public; POST/PUT/DELETE need an admin JWT."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.database import get_db
from app.models import Category, MenuItem
from app.schemas.schemas import CategoryIn, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.id).all()


@router.post("", response_model=CategoryOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_category(data: CategoryIn, db: Session = Depends(get_db)):
    exists = db.query(Category).filter(Category.name.ilike(data.name)).first()
    if exists:
        raise HTTPException(400, "A category with this name already exists")

    category = Category(name=data.name, description=data.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryOut, dependencies=[Depends(get_current_admin)])
def update_category(category_id: int, data: CategoryIn, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(404, "Category not found")

    same_name = db.query(Category).filter(Category.name.ilike(data.name), Category.id != category_id).first()
    if same_name:
        raise HTTPException(400, "A category with this name already exists")

    category.name = data.name
    category.description = data.description
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", dependencies=[Depends(get_current_admin)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(404, "Category not found")

    # Do not delete a category that still has food items
    item_count = db.query(MenuItem).filter(MenuItem.category_id == category_id).count()
    if item_count > 0:
        raise HTTPException(400, "This category still has menu items. Move or delete them first")

    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}
