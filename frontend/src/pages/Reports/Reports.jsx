import { useState } from "react";
import "./Reports.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  return (
    <div className="page-container">
      <PageHeader title="Reports" />
      <div className="page-content">
        <div className="kpi-grid">
          <KPICard
            label="Total Revenue"
            value="₹0"
            icon="💰"
            iconBg="#e8f5e9"
          />
          <KPICard label="Total Profit" value="₹0" icon="📈" iconBg="#e3f2fd" />
          <KPICard label="Items Sold" value="0" icon="📦" iconBg="#fff3e0" />
          <KPICard label="Transactions" value="0" icon="🧾" iconBg="#f3e5f5" />
        </div>

        <div className="date-bar">
          <div className="date-fields">
            <div className="date-field">
              <label htmlFor="from-date">From</label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="date-field">
              <label htmlFor="to-date">To</label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          <div className="date-actions">
            <button className="btn-add">Generate Report</button>
            <button className="btn-print">🖨️ Print</button>
          </div>
        </div>

        <Box title="Revenue Overview" subtitle="Last 30 days">
          <div className="rev-chart">
            <div className="rev-chart-inner">
              <div className="rev-y">
                <span>₹5k</span>
                <span>₹4k</span>
                <span>₹3k</span>
                <span>₹2k</span>
                <span>₹1k</span>
                <span>₹0</span>
              </div>
              <div className="rev-area">
                <div className="rev-grid"></div>
                <div className="rev-x">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>
            </div>
          </div>
        </Box>

        <div className="split-row">
          <Box title="Top Selling Products">
            <div className="panel-body">
              <div className="panel-empty">
                <span style={{ fontSize: "28px" }}>📦</span>
                <span>No sales data yet</span>
              </div>
            </div>
          </Box>

          <Box title="Sales by Category">
            <div className="panel-body">
              <div className="panel-empty">
                <span style={{ fontSize: "28px" }}>📊</span>
                <span>No category data yet</span>
              </div>
            </div>
          </Box>
        </div>

        <Box title="Recent Sales">
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="tbl-empty">
                    No sales recorded yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Box>

        <Box title="Cashier Performance">
          <p className="no-data">No performance data available yet</p>
        </Box>
      </div>
    </div>
  );
}
