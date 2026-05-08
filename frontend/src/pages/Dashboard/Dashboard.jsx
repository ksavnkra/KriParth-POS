import "./Dashboard.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";

export default function Dashboard() {
  return (
    <div className="page-container">
      <PageHeader title="Dashboard" />
      <div className="page-content">
        <div className="kpi-grid">
          <KPICard
            label="Today's Sales"
            value="₹0"
            icon="📊"
            iconBg="#e8f5e9"
          />
          <KPICard
            label="Monthly Sales"
            value="₹0"
            icon="📈"
            iconBg="#e3f2fd"
          />
          <KPICard
            label="Total Products"
            value="0"
            icon="📦"
            iconBg="#fff3e0"
          />
          <KPICard
            label="Low Stock Items"
            value="0"
            icon="⚠️"
            iconBg="#fce4ec"
          />
        </div>

        <Box title="Last 7 days overview">
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
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </Box>

        <Box title="Sales by Category" subtitle="This month">
          <div className="chart-wrap" style={{ height: "200px" }}>
            No category data yet
          </div>
        </Box>

        <Box title="Top Products">
          <p className="no-data">No sales data yet</p>
        </Box>

        <Box title="✨ Smart Insights">
          <div className="insights-box">
            <span className="info-icon">ℹ</span>
            <span>
              AI insights will appear here once you start making sales.
            </span>
          </div>
        </Box>
      </div>
    </div>
  );
}
