import { useState } from "react";
import "./Expenses.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";

const expenseList = [
  {
    id: 1,
    name: "supplies expense",
    date: "26 Feb 2026",
    method: "bank",
    note: "Auto-seeded expense entry",
    amount: 1916,
    initial: "S",
    color: "#e8b4b8",
  },
  {
    id: 2,
    name: "food expense",
    date: "26 Feb 2026",
    method: "bank",
    note: "Auto-seeded expense entry",
    amount: 3028,
    initial: "F",
    color: "#b4c8e8",
  },
  {
    id: 3,
    name: "salary expense",
    date: "26 Feb 2026",
    method: "cash",
    note: "Auto-seeded expense entry",
    amount: 3494,
    initial: "S",
    color: "#d4b8e8",
  },
  {
    id: 4,
    name: "rent expense",
    date: "26 Feb 2026",
    method: "bank",
    note: "Auto-seeded expense entry",
    amount: 8500,
    initial: "R",
    color: "#b8e8c8",
  },
  {
    id: 5,
    name: "utilities expense",
    date: "26 Feb 2026",
    method: "cash",
    note: "Auto-seeded expense entry",
    amount: 2150,
    initial: "U",
    color: "#e8d4b4",
  },
];

export default function Expenses() {
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  return (
    <div className="page-container">
      <PageHeader title="Expenses" />
      <div className="page-content">
        <div className="kpi-grid-3">
          <KPICard
            label="Today's Expenses"
            value="₹0"
            icon="📅"
            iconBg="#fde8e8"
          />
          <KPICard
            label="Monthly Expenses"
            value="₹0"
            icon="📊"
            iconBg="#e8f5e9"
          />
          <KPICard
            label="Top Category"
            value="N/A"
            icon="📉"
            iconBg="#f3e5f5"
          />
        </div>

        <Box title="Daily Expenses" subtitle="Last 30 days">
          <div className="chart-wrap">
            <div className="chart-inner">
              <div className="y-axis">
                <span>₹4</span>
                <span>₹3</span>
                <span>₹2</span>
                <span>₹1</span>
                <span>₹0</span>
              </div>
              <div className="chart-body">
                <div className="chart-gridlines"></div>
                <div className="x-axis">
                  <span>7 Apr</span>
                  <span>12 Apr</span>
                  <span>17 Apr</span>
                  <span>22 Apr</span>
                  <span>27 Apr</span>
                  <span>2 May</span>
                </div>
              </div>
            </div>
          </div>
        </Box>

        <Box title="Expense Breakdown">
          <div className="breakdown-empty">No expense breakdown data yet</div>
        </Box>

        <div className="toolbar">
          <div className="filter-row">
            <h2 className="toolbar-title">All Expenses</h2>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              <option>Supplies</option>
              <option>Food</option>
              <option>Salary</option>
              <option>Rent</option>
              <option>Utilities</option>
            </select>
          </div>
          <button className="btn-add">+ Add Expense</button>
        </div>

        <div className="exp-list">
          {expenseList.map((e) => (
            <div key={e.id} className="exp-row">
              <div className="exp-left">
                <div
                  className="exp-avatar"
                  style={{ backgroundColor: e.color }}
                >
                  {e.initial}
                </div>
                <div className="exp-info">
                  <span className="exp-name">{e.name}</span>
                  <span className="exp-meta">
                    {e.date} · {e.method} · {e.note}
                  </span>
                </div>
              </div>
              <div className="exp-right">
                <span className="exp-amount">₹{e.amount.toLocaleString()}</span>
                <button
                  className="icon-btn icon-btn-danger"
                  aria-label="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
