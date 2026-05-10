import { useState, useEffect, useMemo } from "react";
import "./Expenses.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";
import Box from "../../components/Box/Box";
import API from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", method: "cash", note: "", category: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [dailyExpenses, setDailyExpenses] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchExpenses();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showAdd ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showAdd]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/reports/dashboard");
      const stats = res.data.data?.stats;
      setTodayTotal(stats?.expenses?.today || 0);
      setMonthTotal(stats?.expenses?.month || 0);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }

    try {
      const revRes = await API.get("/reports/revenue");
      const rawExpenses = revRes.data.data?.expenses || [];
      
      const lookup = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        lookup[key] = {
          date: key,
          fullDate: `${day}/${month}/${year}`,
          amount: 0
        };
      }

      rawExpenses.forEach(exp => {
        if (lookup[exp._id]) {
          lookup[exp._id].amount = exp.total || 0;
        }
      });

      const finalChartData = Object.values(lookup).sort((a, b) => a.date.localeCompare(b.date));
      setDailyExpenses(finalChartData);

    } catch (err) {
      console.error("Failed to load timeline stats:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      alert(err.response?.data?.error?.message || "Failed to fetch expenses");
    }
  };

  const handleAddExpense = async () => {
    setAddError("");
    if (!newExpense.name || !newExpense.amount) {
      setAddError("Name and amount are required.");
      return;
    }
    setAddLoading(true);
    try {
      setAddError("");
      setAddSuccess("");
      const payload = { ...newExpense, amount: Number(newExpense.amount) };
      const res = await API.post("/expenses", payload);
      if (res?.data?.success) {
        setAddSuccess("Expense added successfully.");
        setNewExpense({ name: "", amount: "", method: "cash", note: "", category: "" });
        fetchDashboard();
        fetchExpenses();
        setTimeout(() => {
          setShowAdd(false);
          setAddSuccess("");
        }, 900);
      } else {
        const msg = res?.data?.error?.message || "Failed to add expense.";
        setAddError(msg);
      }
    } catch (err) {
      console.error("Add expense failed:", err);
      const msg = err.response?.data?.error?.message || "Failed to add expense (network or server error)";
      setAddError(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const topCategory = useMemo(() => {
    if (!expenses || expenses.length === 0) return "N/A";
    
    const totalsMap = {};
    expenses.forEach(e => {
      const cat = e.category || "Uncategorized";
      totalsMap[cat] = (totalsMap[cat] || 0) + (Number(e.amount) || 0);
    });

    let maxAmt = 0;
    let bestCat = "N/A";
    for (const cat in totalsMap) {
      if (totalsMap[cat] > maxAmt) {
        maxAmt = totalsMap[cat];
        bestCat = cat;
      }
    }
    return bestCat.length > 12 ? bestCat.substring(0, 12) + '...' : bestCat;
  }, [expenses]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    ["Supplies", "Food", "Salary", "Rent", "Utilities"].forEach(c => set.add(c));
    expenses.forEach(e => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [expenses]);

  const triggerDeleteExpense = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await API.delete(`/expenses/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      if (res?.data?.success) {
        fetchDashboard();
        fetchExpenses();
      } else {
        alert(res?.data?.error?.message || "Failed to delete expense.");
      }
    } catch (err) {
      console.error("Delete expense failed:", err);
      setDeleteConfirmId(null);
      alert(err.response?.data?.error?.message || "Failed to delete expense (network or server error)");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Expenses" />
      <div className="page-content">
        <div className="kpi-grid-3">
          <KPICard
            label="Today's Expenses"
            value={`₹${todayTotal.toLocaleString()}`}
            icon="📅"
            iconBg="#fde8e8"
          />
          <KPICard
            label="Monthly Expenses"
            value={`₹${monthTotal.toLocaleString()}`}
            icon="📊"
            iconBg="#e8f5e9"
          />
          <KPICard
            label="Top Category"
            value={topCategory}
            icon="📉"
            iconBg="#f3e5f5"
          />
        </div>

        <Box title="Daily Expenses" subtitle="Historical breakdown by date">
          <div style={{ width: '100%', height: 300, paddingTop: 20 }}>
            {dailyExpenses.length === 0 ? (
              <div className="no-data" style={{ textAlign: 'center', paddingTop: 100 }}>No expense history available yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyExpenses} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="fullDate" 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`₹${value}`, 'Spent']}
                  />
                  <Bar dataKey="amount" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
              <option value="All Categories">All Categories</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
            <button className="btn-add" onClick={() => setShowAdd(true)}>+ Add Expense</button>
        </div>

        <div className="exp-list">
          {expenses
            .filter(e => {
              if (categoryFilter === "All Categories") return true;
              return e.category?.toLowerCase() === categoryFilter.toLowerCase();
            })
            .map((e) => (
            <div key={e._id} className="exp-row">
              <div className="exp-left">
                <div className="exp-avatar" style={{ backgroundColor: "#eee" }}>
                  {e.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="exp-info">
                  <span className="exp-name">{e.name}</span>
                  <span className="exp-meta">
                    {new Date(e.date).toLocaleDateString('en-GB')} · <strong>{e.category || 'Uncategorized'}</strong> · {e.method}
                  </span>
                  {e.note && <span className="exp-meta" style={{ fontStyle: 'italic', fontSize: '12px' }}>{e.note}</span>}
                </div>
              </div>
              <div className="exp-right">
                <span className="exp-amount">₹{Number(e.amount).toLocaleString()}</span>
                <button
                  className="icon-btn icon-btn-danger"
                  aria-label="Delete"
                  onClick={() => setDeleteConfirmId(e._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '24px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <h3 className="form-title" style={{ margin: 0 }}>Add New Expense</h3>
                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }} onClick={() => { setAddError(""); setShowAdd(false); }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Expense Title *</label>
                    <input 
                      type="text"
                      value={newExpense.name} 
                      onChange={(e) => setNewExpense((s) => ({ ...s, name: e.target.value }))} 
                      placeholder="e.g. Rent, Office" 
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Category (Flexible)</label>
                    <input 
                      type="text"
                      list="expenseCats"
                      value={newExpense.category} 
                      onChange={(e) => setNewExpense((s) => ({ ...s, category: e.target.value }))} 
                      placeholder="e.g. Food, Supplies" 
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    />
                    <datalist id="expenseCats">
                      <option value="Supplies" />
                      <option value="Food" />
                      <option value="Salary" />
                      <option value="Rent" />
                      <option value="Utilities" />
                      <option value="Travel" />
                      <option value="Marketing" />
                    </datalist>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Amount (₹) *</label>
                    <input 
                      type="number" 
                      value={newExpense.amount} 
                      onChange={(e) => setNewExpense((s) => ({ ...s, amount: e.target.value }))} 
                      placeholder="0.00" 
                      min="0" 
                      step="0.01"
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Payment Method</label>
                    <select 
                      value={newExpense.method} 
                      onChange={(e) => setNewExpense((s) => ({ ...s, method: e.target.value }))}
                      style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white' }}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI Payment</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Note / Description</label>
                  <textarea 
                    value={newExpense.note} 
                    onChange={(e) => setNewExpense((s) => ({ ...s, note: e.target.value }))} 
                    placeholder="Additional context..." 
                    rows={3}
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                {addError && (
                  <p style={{ fontSize: '13px', color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2', margin: 0 }}>
                    {addError}
                  </p>
                )}
                {addSuccess && (
                  <p style={{ fontSize: '13px', color: '#059669', background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #d1fae5', margin: 0 }}>
                    {addSuccess}
                  </p>
                )}

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <button type="button" className="modal-cancel" onClick={() => { setAddError(""); setShowAdd(false); }} style={{ flex: 1 }}>Cancel</button>
                  <button 
                    type="button" 
                    onClick={handleAddExpense} 
                    disabled={addLoading || !newExpense.name || !newExpense.amount}
                    style={{ flex: 2, background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', opacity: (addLoading || !newExpense.name || !newExpense.amount) ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {addLoading ? "Processing..." : "Add Expense"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fully isolated custom confirm modal for consistency across whole UI */}
        {deleteConfirmId && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', padding: '25px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b' }}>Delete Expense?</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px' }}>Are you sure you want to permanently erase this expense record?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={triggerDeleteExpense} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
