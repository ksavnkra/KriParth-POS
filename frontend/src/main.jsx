import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import POS from "./pages/POS/POS.jsx";
import Stock from "./pages/Stock/Stock.jsx";
import Products from "./pages/Products/Products.jsx";
import Expenses from "./pages/Expenses/Expenses.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Users from "./pages/Users/Users.jsx";
import Admin from "./pages/Admin/Admin.jsx";
import Categories from "./pages/Categories/Categories.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "pos", element: <POS /> },
      { path: "stock", element: <Stock /> },
      { path: "products", element: <Products /> },
      { path: "categories", element: <Categories /> },
      { path: "expenses", element: <Expenses /> },
      { path: "signup", element: <Signup /> },
      { path: "users", element: <Users /> },
      { path: "admin", element: <Admin /> },
      { path: "reports", element: <Reports /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
