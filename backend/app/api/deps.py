"""get_current_admin: put this on any route that only admins may use."""
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models import Admin

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    """Reads 'Authorization: Bearer <token>', checks the JWT and returns the admin."""
    if credentials is None:
        raise HTTPException(401, "Please log in first")

    try:
        data = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Your session has expired. Please log in again")
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token. Please log in again")

    admin = db.get(Admin, int(data["sub"]))
    if admin is None:
        raise HTTPException(401, "Admin account not found")
    return admin
