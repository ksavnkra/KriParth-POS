import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

import dashboardIcon from "../../assets/Icons/Dashboard.png";
import posIcon from "../../assets/Icons/posIcon.png";
import stockIcon from "../../assets/Icons/stockIcon.png";
import productsIcon from "../../assets/Icons/productsIcon.png";
import expensesIcon from "../../assets/Icons/expensesIcon.png";
import reportsIcon from "../../assets/Icons/reportsIcon.png";
import userIcon from "../../assets/Icons/userIcon.png";
import signoutIcon from "../../assets/Icons/signoutIcon.png";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleAdminClick = () => {
    if (user?.role === 'admin') {
      navigate("/admin");
      setIsOpen(false);
    }
  };

  return (
    <div className={`Sidebar ${isOpen ? "open" : ""}`}>
      <img
        src="/logoWithText.png"
        alt="logo"
        className="logo"
        draggable="false"
      />
      <hr className="line" />

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <Link to="/dashboard" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
          <img src={dashboardIcon} alt="dashboard-icon" className="icon" />
          <h2>Dashboard</h2>
        </Link>
      )}

      {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'cashier') && (
        <Link to="/pos" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
          <img src={posIcon} alt="pos-icon" className="icon" />
          <h2>POS</h2>
        </Link>
      )}

      {user?.role === 'admin' && (
        <>
          <Link to="/products" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
            <img src={productsIcon} alt="products-icon" className="icon" />
            <h2>Products</h2>
          </Link>
          <Link to="/categories" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
            <img src={productsIcon} alt="categories-icon" className="icon" />
            <h2>Categories</h2>
          </Link>
          <Link to="/reports" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
            <img src={reportsIcon} alt="reports-icon" className="icon" />
            <h2>Reports</h2>
          </Link>
        </>
      )}

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <>
          <Link to="/stock" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
            <img src={stockIcon} alt="stock-icon" className="icon" />
            <h2>Stock</h2>
          </Link>
          <Link to="/expenses" className="sideBarMenuItem" onClick={() => setIsOpen(false)}>
            <img src={expensesIcon} alt="expenses-icon" className="icon" />
            <h2>Expenses</h2>
          </Link>
        </>
      )}

      <hr className="line line-bottom" />

      <div 
        className={`sideBarMenuItem sidebar-user ${user?.role === 'admin' ? 'admin-clickable' : ''}`}
        onClick={handleAdminClick}
        style={{ cursor: user?.role === 'admin' ? 'pointer' : 'default' }}
      >
        <img src={userIcon} alt="user" className="icon" draggable="false" />
        <h3>{user?.name || "User"}</h3>
      </div>
      <button className="sideBarMenuItem" onClick={handleSignOut}>
        <img src={signoutIcon} alt="signout-icon" className="icon" />
        <h2>Sign Out</h2>
      </button>
    </div>
  );
}
