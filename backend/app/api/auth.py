"""POST /api/auth/login"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.db.database import get_db
from app.models import Admin
from app.schemas.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email.strip().lower()).first()

    # Same message for wrong email OR wrong password (do not tell attackers which one)
    if admin is None or not verify_password(data.password, admin.password_hash):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token(admin.id, admin.email)
    return TokenResponse(access_token=token, admin_name=admin.name)
