import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_ACCESS = {
  cashier: ["/", "/pos"],
  manager: ["/", "/dashboard", "/pos", "/stock", "/expenses"],
  admin: ["/", "/dashboard", "/pos", "/stock", "/products", "/categories", "/expenses", "/reports", "/signup", "/users", "/admin"],
};

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  const allowedRoutes = ROLE_ACCESS[role] || [];
  const currentPath = location.pathname;

  if (!allowedRoutes.includes(currentPath)) {
    const fallback = role === "cashier" ? "/pos" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
