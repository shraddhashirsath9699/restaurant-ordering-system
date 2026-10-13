// Sidebar + page for all admin pages (except login).
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const { adminName, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="logo">
          Spice<span>Route</span> <small>Admin</small>
        </div>
        <nav onClick={() => setOpen(false)}>
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/menu">Menu</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
        </nav>
        <div className="admin-user">
          <p>Hi, {adminName}</p>
          <button className="btn btn-outline btn-small" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle admin menu">☰</button>
          <span>Admin Panel</span>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
