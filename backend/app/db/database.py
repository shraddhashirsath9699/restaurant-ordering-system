"""Database connection. Every API request gets its own session via get_db()."""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    """FastAPI dependency: open a session, give it to the route, then close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
