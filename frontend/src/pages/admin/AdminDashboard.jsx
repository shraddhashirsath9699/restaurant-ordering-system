import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorBox, Loading } from "../../components/StateMessages";
import { getDashboard } from "../../services/api";
import { formatPrice, getErrorMessage } from "../../utils/helpers";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      const response = await getDashboard();
      setStats(response.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Load now, then refresh every 20 seconds so new orders show up
  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 20000);
    return () => clearInterval(timer);
  }, []);

  if (error && !stats) return <ErrorBox message={error} onRetry={loadStats} />;
  if (!stats) return <Loading text="Loading dashboard..." />;

  const cards = [
    { label: "Today's Orders", value: stats.todays_orders },
    { label: "Pending Orders", value: stats.pending_orders },
    { label: "Preparing Orders", value: stats.preparing_orders },
    { label: "Completed Orders", value: stats.completed_orders },
    { label: "Cancelled Orders", value: stats.cancelled_orders },
    { label: "Today's Revenue", value: formatPrice(stats.todays_revenue) },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <p>{card.label}</p>
            <h2>{card.value}</h2>
          </div>
        ))}
      </div>
      <Link to="/admin/orders" className="btn btn-gold">Manage Orders</Link>
    </div>
  );
}

export default AdminDashboard;
