"""Starts the FastAPI app. Run with:  uvicorn app.main:app --reload"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import admin_orders, auth, categories, menu, orders
from app.core.config import FRONTEND_URL
from app.db.database import Base, engine
import app.models  # noqa: F401  (loads the tables so create_all can see them)

# Creates the tables if they do not exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant Ordering API", version="1.0.0")

# CORS: lets the React app (a different port) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Turn Pydantic's long error list into one friendly sentence for the frontend."""
    messages = []
    for error in exc.errors():
        field = str(error["loc"][-1]) if error["loc"] else "input"
        text = error["msg"].replace("Value error, ", "")
        messages.append(text if error["type"] == "value_error" else f"{field}: {text}")
    return JSONResponse(status_code=422, content={"detail": "; ".join(messages)})


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(admin_orders.router)


@app.get("/")
def home():
    return {"message": "Restaurant Ordering API is running. Open /docs to see all endpoints."}
