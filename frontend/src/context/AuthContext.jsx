// Admin login state. The JWT token is kept in localStorage.
import { createContext, useContext, useState } from "react";
import { loginAdmin } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [adminName, setAdminName] = useState(localStorage.getItem("admin_name") || "");

  // Calls the backend. If the login fails, the error goes to the login page.
  async function login(email, password) {
    const response = await loginAdmin(email, password);
    localStorage.setItem("admin_token", response.data.access_token);
    localStorage.setItem("admin_name", response.data.admin_name);
    setToken(response.data.access_token);
    setAdminName(response.data.admin_name);
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    setToken(null);
    setAdminName("");
  }

  return <AuthContext.Provider value={{ token, adminName, isLoggedIn: !!token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
