import { useLocation } from "react-router-dom";
import userIcon from "../../assets/Icons/userIcon.png";
import "./TopBar.css";

const pageNames = {
  dashboard: "Dashboard",
  pos: "POS",
  stock: "Stock",
  products: "Products",
  expenses: "Expenses",
  reports: "Reports",
};

export default function TopBar({ onHamburgerClick }) {
  const location = useLocation();
  const currentPage = location.pathname.replace("/", "") || "dashboard";
  const pageName = pageNames[currentPage] || "Dashboard";

  return (
    <div className="topbar">
      <button className="topbar-hamburger" onClick={onHamburgerClick}>
        <span className="topbar-hamburger-line"></span>
        <span className="topbar-hamburger-line"></span>
        <span className="topbar-hamburger-line"></span>
      </button>

      <h1 className="topbar-title">{pageName}</h1>

      <div className="topbar-user">
        <img
          src={userIcon}
          alt="user"
          className="topbar-avatar"
          draggable="false"
        />
        <span className="topbar-username">Username</span>
      </div>
    </div>
  );
}
