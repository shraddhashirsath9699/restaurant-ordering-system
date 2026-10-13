import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import OrderStatusTracker from "../../components/OrderStatusTracker";
import { ErrorBox, Loading } from "../../components/StateMessages";
import { useToast } from "../../context/ToastContext";
import { getAdminOrder, updateOrderStatus } from "../../services/api";
import { FINAL_STATUSES, formatDate, formatPrice, getErrorMessage } from "../../utils/helpers";

function AdminOrderDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadOrder() {
    setError("");
    try {
      const response = await getAdminOrder(id);
      setOrder(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  // Change the status and save it in the database
  async function changeStatus(newStatus) {
    if ((newStatus === "Cancelled" || newStatus === "Rejected") && !window.confirm(`Mark this order as ${newStatus}?`)) {
      return;
    }
    setSaving(true);
    try {
      const response = await updateOrderStatus(order.id, newStatus);
      setOrder(response.data);
      showToast(`Status changed to ${newStatus}`);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <ErrorBox message={error} onRetry={loadOrder} />;
  if (!order) return <Loading text="Loading order..." />;

  const flow = order.status_flow;
  const isFinal = FINAL_STATUSES.includes(order.status);
  const currentIndex = flow.indexOf(order.status);
  const acceptedIndex = flow.indexOf("Accepted");
  const nextStatus = flow[currentIndex + 1];
  const canAccept = !isFinal && currentIndex < acceptedIndex;
  const canReject = !isFinal && currentIndex < acceptedIndex;
  const canMoveNext = !isFinal && currentIndex >= acceptedIndex && nextStatus;
  const canCancel = !isFinal && currentIndex >= acceptedIndex;

  return (
    <div>
      <Link to="/admin/orders" className="link-button">← Back to orders</Link>
      <div className="order-head">
        <div>
          <h1>{order.order_number}</h1>
          <p className="muted">{order.order_type} · {formatDate(order.created_at)}</p>
        </div>
        <span className="status-badge">{order.status}</span>
      </div>

      <div className="detail-grid">
        <div className="form-card">
          <h3>Customer</h3>
          <p>{order.customer_name}</p>
          <p>{order.mobile}</p>
          {order.email && <p>{order.email}</p>}
          {order.order_type === "Delivery" && (
            <p>{order.address}, {order.city} - {order.pincode}{order.landmark ? ` (near ${order.landmark})` : ""}</p>
          )}
          {order.order_type === "Dine-in" && <p>Table: {order.table_number}</p>}
          {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
          <p className="muted small">Payment: {order.payment_method} ({order.payment_status})</p>
        </div>

        <div className="form-card">
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
        </div>
      </div>

      <div className="form-card">
        <h3>Progress</h3>
        <OrderStatusTracker steps={flow} currentStatus={order.status} />

        <div className="button-row">
          {canAccept && <button className="btn btn-gold" disabled={saving} onClick={() => changeStatus("Accepted")}>Accept Order</button>}
          {canReject && <button className="btn btn-danger" disabled={saving} onClick={() => changeStatus("Rejected")}>Reject</button>}
          {canMoveNext && <button className="btn btn-gold" disabled={saving} onClick={() => changeStatus(nextStatus)}>Mark as {nextStatus}</button>}
          {canCancel && <button className="btn btn-danger" disabled={saving} onClick={() => changeStatus("Cancelled")}>Cancel Order</button>}
          {isFinal && <p className="muted">This order is {order.status}. No more changes are possible.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetail;
