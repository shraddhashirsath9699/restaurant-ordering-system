import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorBox, Loading } from "../../components/StateMessages";
import { getAdminOrders } from "../../services/api";
import { formatDate, formatPrice, getErrorMessage } from "../../utils/helpers";

const ALL_STATUSES = [
  "Order Placed", "Pending", "Accepted", "Preparing", "Ready", "Ready for Pickup",
  "Out for Delivery", "Delivered", "Completed", "Served", "Cancelled", "Rejected",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      // Empty filters are removed by Axios when value is undefined
      const response = await getAdminOrders({
        search: search.trim() || undefined,
        status: status || undefined,
        order_type: orderType || undefined,
      });
      setOrders(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Reload whenever a filter changes (search waits a little while typing)
  useEffect(() => {
    const timer = setTimeout(loadOrders, 300);
    return () => clearTimeout(timer);
  }, [search, status, orderType]);

  return (
    <div>
      <h1>Orders</h1>
      <div className="filter-row">
        <input type="search" placeholder="Search order no, name or mobile" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option value="">All types</option>
          <option>Delivery</option>
          <option>Takeaway</option>
          <option>Dine-in</option>
        </select>
      </div>

      {loading && <Loading text="Loading orders..." />}
      {error && <ErrorBox message={error} onRetry={loadOrders} />}
      {!loading && !error && orders.length === 0 && <EmptyState title="No orders found" text="Try changing the filters." />}

      {!loading && !error && orders.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order No</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th>Placed</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}<br /><small className="muted">{order.mobile}</small></td>
                  <td>{order.order_type}</td>
                  <td>{formatPrice(order.total_amount)}</td>
                  <td><span className="status-badge">{order.status}</span></td>
                  <td>{formatDate(order.created_at)}</td>
                  <td><Link to={`/admin/orders/${order.id}`} className="btn btn-outline btn-small">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
