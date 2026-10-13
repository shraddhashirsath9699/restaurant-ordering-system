# SpiceRoute – Restaurant Food Ordering System

A full-stack restaurant food ordering system developed for the Tribaze Systems technical assessment.

## Tech Stack

* Frontend: React.js
* Backend: Python, FastAPI
* Database: PostgreSQL
* Authentication: JWT
* API Communication: REST API

## Features

### Customer

* Browse food items and categories.
* Search and filter menu items.
* Add, update, and remove cart items.
* Place Delivery, Takeaway, and Dine-in orders.
* Track order status.

### Admin

* Admin login with JWT authentication.
* Dashboard with order statistics and today's revenue.
* View and manage orders and update order status.
* Add, edit, enable/disable, and delete menu items.
* Manage food categories.

## Requirements

* Python 3.11 or 3.12
* Node.js and npm
* PostgreSQL

## Setup and Run

### 1. Database

Create a PostgreSQL database named `restaurant_db`.

### 2. Backend

Open a terminal in the project folder and run:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file using `.env.example` and configure the PostgreSQL connection string and a secure secret key.

Seed the database with demo data:

```powershell
python seed.py
```

Start the backend:

```powershell
uvicorn app.main:app --reload
```

API documentation: http://localhost:8000/docs

### 3. Frontend

Open a second terminal in the project folder and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the website at http://localhost:5173

## Demo Admin Login

* URL: http://localhost:5173/admin/login
* Email: `admin@spiceroute.com`
* Password: `Admin@123`

These are demo credentials for local assessment only. Change the password and use a secure secret key before production deployment.

## Order Calculation

The backend retrieves menu prices from PostgreSQL and calculates the order total.

* Tax: 5%
* Delivery charge: ₹40
* Free delivery for orders with a subtotal of ₹500 or more

## Notes

* Keep both backend and frontend terminals running while using the application.
* Do not share the backend `.env` file or real secrets.
* `.env.example` contains the required environment variable names without real secrets.
