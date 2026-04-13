import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import POS from "./pages/POS/POS.jsx";
import Stock from "./pages/Stock/Stock.jsx";
import Products from "./pages/Products/Products.jsx";
import Expenses from "./pages/Expenses/Expenses.jsx";
import Reports from "./pages/Reports/Reports.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "pos", element: <POS /> },
      { path: "stock", element: <Stock /> },
      { path: "products", element: <Products /> },
      { path: "expenses", element: <Expenses /> },
      { path: "reports", element: <Reports /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
