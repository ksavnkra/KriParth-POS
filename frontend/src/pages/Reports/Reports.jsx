import { useState, useEffect } from "react";
import API from "../../services/api";
import "./Reports.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];
  const getMonthAgo = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  };
  const [fromDate, setFromDate] = useState(getMonthAgo());
  const [toDate, setToDate] = useState(today);
  const [summary, setSummary] = useState({ totalSales: 0, totalRevenue: 0, totalDiscount: 0, avgOrderValue: 0 });
  const [profit, setProfit] = useState({ totalRevenue: 0, grossProfit: 0, totalItems: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [cashierData, setCashierData] = useState([]);
  const [dailyChartData, setDailyChartData] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [aiInsights, setAiInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const params = { startDate: fromDate, endDate: toDate };
      const [salesRes, revenueRes, topRes, salesListRes, cashierRes, logsRes] = await Promise.all([
        API.get("/reports/sales", { params }).catch((e) => { console.error('sales report error', e); return null; }),
          API.get("/reports/revenue", { params }).catch((e) => { console.error('revenue report error', e); return null; }),
          API.get("/reports/products/top", { params: { ...params, limit: 5 } }).catch((e) => { console.error('top products error', e); return null; }),
          API.get("/sales", { params: { ...params, limit: 10 } }).catch((e) => { console.error('sales list error', e); return null; }),
          API.get("/reports/cashier-performance", { params }).catch((e) => { console.error('cashier perf error', e); return null; }),
          API.get("/inventory/logs", { params: { ...params, limit: 100 } }).catch((e) => { console.error('inventory logs error', e); return null; }),
      ]);

      let updatedSummary = summary;
      let updatedProfit = profit;
      let updatedTopProducts = topProducts;
      let updatedRecentSales = recentSales;
      let updatedCashierData = cashierData;

      if (salesRes?.data?.data?.summary) {
        updatedSummary = salesRes.data.data.summary;
        setSummary(updatedSummary);
      }
      if (revenueRes?.data?.data) {
        updatedProfit = revenueRes.data.data.profit || {};
        setProfit(updatedProfit);
      }
      if (topRes?.data?.data) {
        updatedTopProducts = topRes.data.data;
        setTopProducts(updatedTopProducts);
      }
      if (salesListRes?.data?.data) {
        updatedRecentSales = salesListRes.data.data;
        setRecentSales(updatedRecentSales);
      }
      if (cashierRes?.data?.data) {
        updatedCashierData = cashierRes.data.data;
        setCashierData(updatedCashierData);
      }
      if (logsRes?.data?.data) setStockLogs(logsRes.data.data);

      if (revenueRes?.data?.data) {
        const revData = revenueRes.data.data.revenue || [];
        const expData = revenueRes.data.data.expenses || [];
        
        const lookup = {};
        
        revData.forEach(r => {
          if (!lookup[r._id]) lookup[r._id] = { date: r._id, revenue: 0, expenses: 0 };
          lookup[r._id].revenue = r.total || 0;
        });
        expData.forEach(e => {
          if (!lookup[e._id]) lookup[e._id] = { date: e._id, revenue: 0, expenses: 0 };
          lookup[e._id].expenses = e.total || 0;
        });

        const combined = Object.values(lookup)
          .map(d => {
            const dateObj = new Date(d.date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            return {
              ...d,
              fullDate: isNaN(dateObj) ? d.date : `${day}/${month}/${year}`
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
        
        setDailyChartData(combined);
      }

      await generateAIInsights({
        summary: updatedSummary,
        profit: updatedProfit,
        topProducts: updatedTopProducts,
        recentSales: updatedRecentSales,
        cashierData: updatedCashierData
      });
    } catch (err) {
      console.error("Report fetch error:", err);
    }
  };

  const handleGenerate = async () => {
    if (!fromDate || !toDate) return alert("Please select both From and To dates");
    await fetchReportData();
  };

  const generateAIInsights = async (data) => {
    try {
      setLoadingInsights(true);
      const reportData = {
        dateRange: { from: fromDate, to: toDate },
        summary: data.summary || summary,
        profit: data.profit || profit,
        topProducts: data.topProducts || topProducts,
        cashierPerformance: data.cashierData || cashierData,
        recentSales: (data.recentSales || recentSales).slice(0, 5),
      };

      const response = await API.post("/ai/report-insights", { reportData });
      if (response.data?.data?.insights) {
        setAiInsights(response.data.data.insights);
      }
    } catch (err) {
      console.error("Failed to generate AI insights:", err);
      setAiInsights("Unable to generate AI insights. Please check your API configuration.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const adjustmentLogs = stockLogs.filter(l => ["adjustment", "restock", "return"].includes(l.type));

  return (
    <div className="page-container">
      <PageHeader title="Reports" />
      <div className="page-content">
        <div className="kpi-grid">
          <KPICard
            label="Total Revenue"
            value={`₹${Math.round((profit.totalRevenue || summary.totalRevenue) || 0).toLocaleString()}`}
            icon="💰"
            iconBg="#e8f5e9"
          />
          <KPICard
            label="Gross Profit"
            value={`₹${Math.round(profit.grossProfit || 0).toLocaleString()}`}
            icon="📈"
            iconBg="#e3f2fd"
          />
          <KPICard
            label="Items Sold"
            value={profit.totalItems || 0}
            icon="📦"
            iconBg="#fff3e0"
            className="print-hide"
          />
          <KPICard
            label="Transactions"
            value={summary.totalSales || 0}
            icon="🧾"
            iconBg="#f3e5f5"
            className="print-hide"
          />
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
            <button className="btn-add" onClick={handleGenerate}>Generate Report</button>
            <button className="btn-print" onClick={() => window.print()}>🖨️ Print</button>
          </div>
        </div>

        <div className="print-hide">
          <Box title="Revenue vs Expenses Timeline" subtitle={`Trend for range: ${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}`}>
            <div style={{ width: '100%', height: 320, padding: '20px 0 10px' }}>
              {dailyChartData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No financial activity recorded for the selected period. Try expanding the date range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="fullDate" 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', fontSize: '13px' }} 
                      formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name === 'revenue' ? 'Total Revenue' : 'Total Expenses']} 
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', fontWeight: '500', paddingTop: '20px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Box>
        </div>

        <div className="print-only">
          <Box title="Detailed Daily Records" subtitle={`Daily financial breakdown from ${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}`}>
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Revenue</th>
                    <th>Total Expenses</th>
                    <th>Net Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyChartData.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No record found</td></tr>
                  ) : (
                    dailyChartData.map((d) => (
                      <tr key={d.date}>
                        <td className="td-bold">{d.fullDate}</td>
                        <td style={{ color: '#0d9488', fontWeight: '600' }}>₹{Number(d.revenue || 0).toLocaleString()}</td>
                        <td style={{ color: '#ef4444', fontWeight: '600' }}>₹{Number(d.expenses || 0).toLocaleString()}</td>
                        <td className="td-bold">₹{Number((d.revenue || 0) - (d.expenses || 0)).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Box>
        </div>

        <div className="print-only" style={{ marginTop: '20px' }}>
          <Box title="Stock Adjustments Record" subtitle="Manual stock adjustments, restocks and returns during this period">
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product / SKU</th>
                    <th>Type</th>
                    <th>Qty Adjusted</th>
                    <th>Final Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustmentLogs.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No adjustments recorded in this range.</td></tr>
                  ) : (
                    adjustmentLogs.map((l, i) => (
                      <tr key={i}>
                        <td>{new Date(l.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="td-bold">
                          <span style={{ textDecoration: l.product?.isActive === false ? 'line-through' : 'none', color: l.product?.isActive === false ? '#94a3b8' : 'inherit' }}>
                            {l.product?.name || "N/A"}
                          </span>
                          <span style={{color: '#64748b', fontSize: '11px', marginLeft: '5px'}}>({l.product?.sku ? l.product.sku.split('_DELETED_')[0] : '—'})</span>
                        </td>
                        <td><span className="cat-tag" style={{textTransform: 'capitalize'}}>{l.type}</span></td>
                        <td className="td-bold" style={{ color: l.quantity > 0 ? '#0d9488' : '#ef4444' }}>
                          {l.quantity > 0 ? `+${l.quantity}` : l.quantity}
                        </td>
                        <td>{l.newStock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Box>
        </div>

        <div className="split-row print-hide">
          <Box title="Top Selling Products">
            <div className="panel-body">
              {topProducts.length > 0 ? (
                <div className="top-list">
                  {topProducts.map((p, i) => (
                    <div key={i} className="top-item">
                      <span className="top-idx">#{i + 1}</span>
                      <span className="top-pname">{p.productName}</span>
                      <span className="top-pqty">{p.totalQuantity} units</span>
                      <span className="top-prev">₹{p.totalRevenue?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="panel-empty">
                  <span className="empty-panel-icon">📦</span>
                  <span>No sales data yet</span>
                </div>
              )}
            </div>
          </Box>

          <Box title="Sales by Category">
            <div className="panel-body">
              <div className="panel-empty">
                <span className="empty-panel-icon">📊</span>
                <span>No category data yet</span>
              </div>
            </div>
          </Box>
        </div>

        <div className="print-hide">
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
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <tr key={sale._id}>
                        <td className="td-bold">{sale.invoiceNumber}</td>
                        <td>{new Date(sale.createdAt).toLocaleDateString('en-GB')}</td>
                        <td>{sale.items?.length || 0}</td>
                        <td>
                          <span className="cat-tag">{sale.paymentMode?.toUpperCase()}</span>
                        </td>
                        <td className="td-bold">₹{Math.round(sale.grandTotal).toLocaleString()}</td>
                        <td>
                          <span className={`tag ${sale.status === "completed" ? "tag-green" : sale.status === "refunded" ? "tag-red" : "tag-orange"}`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="tbl-empty">
                        No sales recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Box>
        </div>

        <div className="print-hide">
          <Box title="Cashier Performance">
            {cashierData.length > 0 ? (
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Cashier</th>
                      <th>Sales</th>
                      <th>Revenue</th>
                      <th>Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashierData.map((c, i) => (
                      <tr key={i}>
                        <td className="td-bold">{c.cashierName}</td>
                        <td>{c.totalSales}</td>
                        <td>₹{Math.round(c.totalRevenue).toLocaleString()}</td>
                        <td>₹{Math.round(c.avgOrderValue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No performance data available yet</p>
            )}
          </Box>
<br />
          <div className="no-print">
            <Box title="✨ Smart Insights" subtitle="Driven by Google AI Intelligence">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {loadingInsights ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    <p>Generating AI insights...</p>
                  </div>
                ) : aiInsights ? (
                  <div 
                    className="ai-insights-container"
                    style={{ 
                      fontSize: "14px", 
                      lineHeight: "1.6",
                      backgroundColor: "#ffffff",
                      padding: "24px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                    }}
                    dangerouslySetInnerHTML={{ __html: aiInsights.replace(/```html|```/g, '') }}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    <p>Generate a report to see AI insights.</p>
                  </div>
                )}
              </div>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
