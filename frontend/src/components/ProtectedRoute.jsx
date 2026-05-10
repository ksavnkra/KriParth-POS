import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'cashier') {
    const allowedRoutes = ['/pos', '/'];
    const currentPath = location.pathname;
    
    if (!allowedRoutes.includes(currentPath)) {
      return <Navigate to="/pos" replace />;
    }
  }

  return children;
}
