import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/StateMessages";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { createOrder } from "../services/api";
import { calculatePreview, formatPrice, getErrorMessage } from "../utils/helpers";

const EMPTY_FORM = {
  customer_name: "",
  mobile: "",
  email: "",
  order_type: "Delivery",
  address: "",
  city: "",
  pincode: "",
  landmark: "",
  table_number: "",
  notes: "",
};

// Checks the form in the browser first (the backend checks again - never trust only the frontend)
function validateForm(form) {
  const errors = {};
  if (form.customer_name.trim().length < 2) errors.customer_name = "Please enter your name";
  if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) errors.mobile = "Enter a valid 10-digit mobile number";
  if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errors.email = "Enter a valid email";

  if (form.order_type === "Delivery") {
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "Pincode must be 6 digits";
  }
  if (form.order_type === "Dine-in" && !form.table_number.trim()) {
    errors.table_number = "Table number is required";
  }
  return errors;
}

function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const { tax, delivery, total } = calculatePreview(subtotal, form.order_type);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Only send the id and quantity of each item. NOT the price.
    const orderData = {
      ...form,
      items: items.map((item) => ({ menu_item_id: item.id, quantity: item.quantity })),
    };

    setSubmitting(true);
    try {
      const response = await createOrder(orderData);
      clearCart();
      showToast("Order placed successfully!");
      navigate("/track", { state: { order: response.data, justPlaced: true } });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container page-section">
        <EmptyState title="Your cart is empty" text="Add food to your cart before checking out.">
          <Link to="/menu" className="btn btn-gold">Browse Menu</Link>
        </EmptyState>
      </div>
    );
  }

  // A small helper to show a text input with its error message
  function Field({ label, name, type = "text", required = false, placeholder = "" }) {
    return (
      <label className="field">
        <span>{label}{required && " *"}</span>
        <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} />
        {errors[name] && <small className="field-error">{errors[name]}</small>}
      </label>
    );
  }

  return (
    <div className="container page-section">
      <h1>Checkout</h1>
      <form className="cart-layout" onSubmit={handleSubmit} noValidate>
        <div className="form-card">
          <h3>Your Details</h3>
          {Field({ label: "Full name", name: "customer_name", required: true })}
          {Field({ label: "Mobile number", name: "mobile", type: "tel", required: true, placeholder: "10-digit number" })}
          {Field({ label: "Email (optional)", name: "email", type: "email" })}

          <h3>Order Type</h3>
          <div className="radio-row">
            {["Delivery", "Takeaway", "Dine-in"].map((type) => (
              <label key={type} className={`radio-pill ${form.order_type === type ? "active" : ""}`}>
                <input type="radio" name="order_type" value={type} checked={form.order_type === type} onChange={handleChange} />
                {type}
              </label>
            ))}
          </div>

          {form.order_type === "Delivery" && (
            <>
              {Field({ label: "Address", name: "address", required: true })}
              {Field({ label: "City", name: "city", required: true })}
              {Field({ label: "Pincode", name: "pincode", required: true, placeholder: "6 digits" })}
              {Field({ label: "Landmark (optional)", name: "landmark" })}
            </>
          )}

          {form.order_type === "Dine-in" && Field({ label: "Table number", name: "table_number", required: true })}

          {Field({ label: "Notes for the kitchen (optional)", name: "notes" })}
          <p className="muted small">Payment: Cash on delivery / at the counter.</p>
        </div>

        <aside className="summary-card">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span></div>
          <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(total)}</span></div>
          <p className="muted small">Delivery is free on orders of ₹500 or more. The final amount is confirmed by our server.</p>

          {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

          <button type="submit" className="btn btn-gold btn-large btn-full" disabled={submitting}>
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;
