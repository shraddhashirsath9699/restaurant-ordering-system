// Order confirmation + tracking in one page.
// After checkout we arrive here with the new order in "location.state".
// A visitor can also type an order number and mobile number to track an order.
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OrderStatusTracker from "../components/OrderStatusTracker";
import { trackOrder } from "../services/api";
import { FINAL_STATUSES, formatDate, formatPrice, getErrorMessage } from "../utils/helpers";

function TrackOrder() {
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const justPlaced = location.state?.justPlaced || false;

  const [orderRef, setOrderRef] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchOrder(ref, mobileNumber) {
    const response = await trackOrder(ref, mobileNumber);
    setOrder(response.data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!orderRef.trim() || !mobile.trim()) {
      setError("Please enter both the order number and the mobile number");
      return;
    }
    setLoading(true);
    try {
      await fetchOrder(orderRef.trim(), mobile.trim());
    } catch (err) {
      setOrder(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Refresh the status every 15 seconds until the order is finished
  useEffect(() => {
    if (!order || FINAL_STATUSES.includes(order.status)) return;
    const timer = setInterval(() => {
      fetchOrder(order.order_number, order.mobile).catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [order]);

  return (
    <div className="container page-section narrow">
      {justPlaced && order && (
        <div className="alert alert-success">
          <h2>Thank you, {order.customer_name}! 🎉</h2>
          <p>Your order <strong>{order.order_number}</strong> has been placed. Save this number to track your order.</p>
        </div>
      )}

      <h1>Track Your Order</h1>

      <form className="form-card track-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Order number</span>
          <input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="ORD-2026-000125" />
        </label>
        <label className="field">
          <span>Mobile number</span>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile used for the order" type="tel" />
        </label>
        <button className="btn btn-gold" disabled={loading}>{loading ? "Searching..." : "Track Order"}</button>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
      </form>

      {order && (
        <div className="form-card order-result">
          <div className="order-head">
            <div>
              <h2>{order.order_number}</h2>
              <p className="muted">{order.order_type} · {formatDate(order.created_at)}</p>
            </div>
            <span className="status-badge">{order.status}</span>
          </div>

          <OrderStatusTracker steps={order.status_flow} currentStatus={order.status} />

          <h3>Items</h3>
          {order.items.map((item) => (
            <div className="summary-row" key={item.menu_item_id}>
              <span>{item.item_name} × {item.quantity}</span>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="summary-row"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{formatPrice(order.delivery_charge)}</span></div>
          <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(order.total_amount)}</span></div>
          <p className="muted small">Payment: {order.payment_method} ({order.payment_status})</p>

          {order.order_type === "Delivery" && (
            <p className="small">Delivering to: {order.address}, {order.city} - {order.pincode}{order.landmark ? ` (near ${order.landmark})` : ""}</p>
          )}
          {order.order_type === "Dine-in" && <p className="small">Table number: {order.table_number}</p>}
        </div>
      )}
    </div>
  );
}

export default TrackOrder;
