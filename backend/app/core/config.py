"""Reads settings from the .env file so secrets are not written inside the code."""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5432/restaurant_db"
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Business rules used when calculating an order total
TAX_PERCENT = 5            # 5% tax on the subtotal
DELIVERY_CHARGE = 40       # flat charge for Delivery orders
FREE_DELIVERY_ABOVE = 500  # delivery is free if subtotal is this or more
