// All Axios calls live here, so pages stay clean.
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 15000,
});

// Before every request: if the admin is logged in, add the JWT token header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if an admin page gets 401 (token expired/invalid), go to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const onAdminPage = window.location.pathname.startsWith("/admin");
    const onLoginPage = window.location.pathname === "/admin/login";
    if (error.response?.status === 401 && onAdminPage && !onLoginPage) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_name");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// ----- Auth -----
export const loginAdmin = (email, password) => api.post("/api/auth/login", { email, password });

// ----- Categories -----
export const getCategories = () => api.get("/api/categories");
export const createCategory = (data) => api.post("/api/categories", data);
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

// ----- Menu -----
export const getMenu = (params) => api.get("/api/menu", { params });
export const createMenuItem = (data) => api.post("/api/menu", data);
export const updateMenuItem = (id, data) => api.put(`/api/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/api/menu/${id}`);

// ----- Customer orders -----
export const createOrder = (data) => api.post("/api/orders", data);
export const trackOrder = (orderRef, mobile) => api.get(`/api/orders/${orderRef}`, { params: { mobile } });

// ----- Admin -----
export const getDashboard = () => api.get("/api/admin/dashboard");
export const getAdminOrders = (params) => api.get("/api/admin/orders", { params });
export const getAdminOrder = (id) => api.get(`/api/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/api/admin/orders/${id}/status`, { status });

export default api;
