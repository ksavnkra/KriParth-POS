import { useState, useEffect } from "react";
import API from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
const PIE_COLORS = ["#0d9488", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
import "./Dashboard.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: { today: 0, month: 0 },
    expenses: { today: 0, month: 0 },
    netProfit: 0,
    latestSales: [],
    lastSale: null,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [chartsData, setChartsData] = useState({ categoryData: [] });
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const [statsRes, topRes, revRes] = await Promise.all([
        API.get("/reports/dashboard"),
        API.get("/reports/products/top", { params: { limit: 5 } }).catch(() => ({ data: { data: [] } })),
        API.get("/reports/revenue", { params: { startDate: lastWeek } }).catch(() => ({ data: { data: { revenue: [], expenses: [] } } }))
      ]);

      const data = statsRes.data.data || {};
      setStats(data.stats || {
        revenue: data.revenue || { today: 0, month: 0 },
        expenses: data.expenses || { today: 0, month: 0 },
        latestSales: data.latestSales || [],
        lastSale: data.lastSale || null
      });
      
      setChartsData(data.charts || { categoryData: [] });
      setLowStock(data.lowStock || []);
      setTopProducts(topRes.data.data || []);
      
      const reportData = revRes.data.data || {};
      
      // 1. Generate last 7 consecutive dates object to map onto
      const lookup = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Generate local YYYY-MM-DD string explicitly
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        lookup[key] = { date: key, rawDate: d, revenue: 0, expenses: 0 };
      }

      // 2. Fill matching days from API
      (reportData.revenue || []).forEach(r => {
        if (lookup[r._id]) lookup[r._id].revenue = r.total || 0;
      });
      (reportData.expenses || []).forEach(e => {
        if (lookup[e._id]) lookup[e._id].expenses = e.total || 0;
      });

      const processed = Object.values(lookup).sort((a, b) => a.date.localeCompare(b.date));
      setDailyData(processed);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartDays = dailyData.map((d) => {
    const date = new Date(d.rawDate);
    const dateStr = `${dayNames[date.getDay()]} ${date.getDate()}`;
    const dD = String(date.getDate()).padStart(2, '0');
    const dM = String(date.getMonth() + 1).padStart(2, '0');
    const dY = date.getFullYear();
    const fullDateStr = `${dD}/${dM}/${dY}`;
    return { day: dateStr, fullDate: fullDateStr, revenue: d.revenue, expenses: d.expenses };
  });

  const maxRevenueData = Math.max(...chartDays.map((d) => d.revenue), 10);
  const maxRevenue = maxRevenueData * 1.2; // Add headroom for labels

  return (
    <div className="page-container">
      <PageHeader title="Dashboard" />
      <div className="page-content">
        <div className="kpi-grid">
          <KPICard
            label="Today's Revenue"
            value={`₹${(stats.revenue?.today || 0).toLocaleString()}`}
            icon="💰"
            iconBg="#e6f4ea"
          />
          <KPICard
            label="Month Revenue"
            value={`₹${(stats.revenue?.month || 0).toLocaleString()}`}
            icon="📈"
            iconBg="#e8f0fe"
          />
          <KPICard
            label="Month Expenses"
            value={`₹${(stats.expenses?.month || 0).toLocaleString()}`}
            icon="💸"
            iconBg="#fef7e0"
          />
          <KPICard
            label="Net Profit"
            value={`₹${(stats.netProfit || 0).toLocaleString()}`}
            icon="💎"
            iconBg={stats.netProfit >= 0 ? "#e6f4ea" : "#fce8e6"}
          />
        </div>

        <div className="dashboard-grid-row">
          <Box title="Revenue & Expenses" subtitle="Last 7 days overview">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartDays.length > 0 ? chartDays : [
                { fullDate: 'May 4', revenue: 0, expenses: 0 },
                { fullDate: 'May 5', revenue: 0, expenses: 0 },
                { fullDate: 'May 6', revenue: 0, expenses: 0 },
                { fullDate: 'May 7', revenue: 0, expenses: 0 },
                { fullDate: 'May 8', revenue: 0, expenses: 0 },
                { fullDate: 'May 9', revenue: 0, expenses: 0 },
                { fullDate: 'May 10', revenue: 0, expenses: 0 }
              ]} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="fullDate" 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '13px', fontWeight: '500' }} 
                  itemStyle={{ padding: '2px 0' }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                  formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', fontWeight: '500', paddingTop: '15px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={35} />
                <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box title="Sales by Category" subtitle="This month">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie 
                  data={chartsData.categoryData.length > 0 ? chartsData.categoryData : [{name: 'No Data', value: 1}]} 
                  innerRadius={55} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value"
                  stroke="none"
                >
                  {(chartsData.categoryData.length > 0 ? chartsData.categoryData : [{name:'None'}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartsData.categoryData.length > 0 ? PIE_COLORS[index % PIE_COLORS.length] : '#f1f5f9'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} contentStyle={{borderRadius: '10px', fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {chartsData.categoryData.slice(0, 4).map((c, i) => (
                <div key={i} className="pie-legend-item">
                  <div className="pie-dot-wrap">
                    <div className="pie-dot" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span>{c.name}</span>
                  </div>
                  <span className="pie-val">₹{c.value.toLocaleString()}</span>
                </div>
              ))}
              {chartsData.categoryData.length === 0 && <span className="no-data" style={{fontSize:'12px', textAlign:'center'}}>No categorized sales.</span>}
            </div>
          </Box>
        </div>

        <div className="dashboard-grid-row">
          <Box title="Top Products">
            {topProducts.length > 0 ? (
              <div className="top-products-list">
                {topProducts.map((p, i) => (
                  <div key={i} className="top-product-row">
                    <span className="top-rank">#{i + 1}</span>
                    <span className="top-name">{p.productName}</span>
                    <span className="top-qty">{p.totalQuantity} sold</span>
                    <span className="top-rev">₹{p.totalRevenue?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No sales data yet</p>
            )}
          </Box>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Box title="Low Stock Alerts">
              <div className="low-stock-list">
                {lowStock.map((item, i) => (
                  <div key={i} className="low-stock-item">
                    <span className="low-stock-name">{item.name}</span>
                    <span className={`low-stock-pill ${item.stock > 5 ? 'warning' : ''}`}>
                      {item.stock} {item.unit || 'units'} left
                    </span>
                  </div>
                ))}
                {lowStock.length === 0 && <p className="no-data" style={{fontSize:'13px'}}>Inventory levels healthy.</p>}
              </div>
            </Box>

            {stats.lastSale && (
              <Box title="Last Bill">
                <div className="last-bill-details">
                  <div className="bill-row">
                    <span className="bill-label">Invoice:</span>
                    <span className="bill-value">{stats.lastSale.invoiceNumber}</span>
                  </div>
                  <div className="bill-row">
                    <span className="bill-label">Amount:</span>
                    <span className="bill-value td-bold">₹{stats.lastSale.grandTotal}</span>
                  </div>
                  <div className="bill-row">
                    <span className="bill-label">By:</span>
                    <span className="bill-value">{stats.lastSale.cashier?.name}</span>
                  </div>
                </div>
              </Box>
            )}
          </div>
        </div>

        <Box title="✨ Smart Insights" subtitle="Driven by Grok Intelligence">
          <div className="insight-card">
            <div className="insight-icon-wrap">💡</div>
            <div className="insight-content">
              <span className="insight-title">Grok Integration Coming Soon</span>
              <span className="insight-desc">
                Connect your account to activate deeply optimized forecasting, customer sentiment tracking, and anomaly detection powered entirely by real-time intelligence.
              </span>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}
