import "./Reports.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";

export default function Reports() {
  return (
    <div className="page-container">
      <PageHeader title="Reports" />
      <div className="page-content">
        <div className="kpi-grid">
          <KPICard
            label="Total Revenue"
            value="₹0"
            icon={<span>💰</span>}
            iconBg="#e8f5e9"
          />
          <KPICard
            label="Total Profit"
            value="₹0"
            icon={<span>📈</span>}
            iconBg="#e3f2fd"
          />
          <KPICard
            label="Items Sold"
            value="0"
            icon={<span>📦</span>}
            iconBg="#fff3e0"
          />
          <KPICard
            label="Transactions"
            value="0"
            icon={<span>🧾</span>}
            iconBg="#f3e5f5"
          />
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <span>No sales data yet</span>
              </div>
            </div>
          </Box>

          <Box title="Sales by Category">
            <div className="panel-body">
              <div className="panel-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
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
