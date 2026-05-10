import { useState, useEffect } from "react";
import API from "../../services/api";
import { Plus, X, Building2, Receipt, AlertTriangle, BarChart, Info, Package, Calculator, Trash2 } from "lucide-react";
import "./Stock.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import KPICard from "../../components/KPICard/KPICard";

export default function Stock() {
  const [stockItems, setStockItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastEdited, setLastEdited] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [form, setForm] = useState({
    product: '', quantity: '', totalPrice: '', pricePerUnit: '',
    sellerName: '', sellerGstNumber: '',
    gstPercentage: 18, gstType: 'cgst_sgst',
    invoiceNumber: '', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stockRes, alertsRes, prodsRes, entRes, summRes] = await Promise.all([
        API.get("/inventory"),
        API.get("/inventory/alerts").catch(() => ({ data: { data: [] } })),
        API.get("/products", { params: { limit: 300 } }),
        API.get("/stock").catch(() => ({ data: { data: [] } })),
        API.get("/stock/summary").catch(() => ({ data: { data: { totalPurchases: 0, totalGstPaid: 0, totalQuantity: 0, bySeller: {} } } })),
      ]);

      setStockItems(stockRes.data.data);
      setAlerts(alertsRes.data.data || []);
      setProducts(prodsRes.data.data || []);
      setEntries(entRes.data.data || []);
      setSummary(summRes.data.data || null);
    } catch (err) {
      console.error("Stock fetch error:", err);
    }
  };

  const gstOptions = [0, 5, 12, 18, 28];

  const handleProductChange = (productId) => {
    const p = products.find(pr => pr._id === productId);
    setForm({ ...form, product: productId, gstPercentage: p?.gstPercentage !== undefined ? p.gstPercentage : 18 });
  };

  const trackEdit = (field) => {
    setLastEdited(prev => {
      const filtered = prev.filter(f => f !== field);
      const updated = [...filtered, field];
      return updated.length > 2 ? updated.slice(-2) : updated;
    });
  };

  const derivedField = (() => {
    const allThree = ['quantity', 'totalPrice', 'pricePerUnit'];
    if (lastEdited.length < 2) return null;
    return allThree.find(f => !lastEdited.includes(f)) || null;
  })();

  const handleFieldChange = (field, value) => {
    const next = { ...form, [field]: value };
    trackEdit(field);

    const sources = lastEdited.filter(f => f !== field);
    sources.push(field);
    const twoSources = sources.slice(-2);
    const target = ['quantity', 'totalPrice', 'pricePerUnit'].find(f => !twoSources.includes(f));

    const q = Number(field === 'quantity' ? value : next.quantity) || 0;
    const t = Number(field === 'totalPrice' ? value : next.totalPrice) || 0;
    const p = Number(field === 'pricePerUnit' ? value : next.pricePerUnit) || 0;

    if (target === 'pricePerUnit' && q > 0 && t > 0) {
      next.pricePerUnit = (t / q).toFixed(2);
    } else if (target === 'totalPrice' && q > 0 && p > 0) {
      next.totalPrice = (q * p).toFixed(2);
    } else if (target === 'quantity' && p > 0 && t > 0) {
      next.quantity = Math.round(t / p).toString();
    }
    setForm(next);
  };

  const fQty = Number(form.quantity) || 0;
  const fTotal = Number(form.totalPrice) || 0;
  const fRate = Number(form.gstPercentage) || 0;
  const fPpu = Number(form.pricePerUnit) || 0;

  const baseAmount = fRate > 0 ? fTotal / (1 + fRate / 100) : fTotal;
  const gstAmount = fTotal - baseAmount;
  const cgst = form.gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
  const sgst = form.gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
  const igst = form.gstType === 'igst' ? gstAmount : 0;
  const basePricePerUnit = fQty > 0 ? baseAmount / fQty : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.product || !fQty || !fTotal) {
      setErrorMsg("Required: Product, Quantity, and Total.");
      return;
    }

    try {
      await API.post('/stock', {
        product: form.product,
        quantity: fQty,
        totalCost: fTotal,
        sellerName: form.sellerName,
        sellerGstNumber: form.sellerGstNumber,
        gstPercentage: fRate,
        gstType: form.gstType,
        invoiceNumber: form.invoiceNumber,
        notes: form.notes,
      });
      setShowForm(false);
      setForm({ product: '', quantity: '', totalPrice: '', pricePerUnit: '', sellerName: '', sellerGstNumber: '', gstPercentage: 18, gstType: 'cgst_sgst', invoiceNumber: '', notes: '' });
      setLastEdited([]);
      fetchData();
    } catch (err) { 
      setErrorMsg(err.response?.data?.error?.message || 'Failed to add stock'); 
    }
  };

  const triggerDeleteStock = async () => {
    if (!deleteConfirmId) return;
    try {
      await API.delete(`/stock/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchData(); 
    } catch (err) {
      setDeleteConfirmId(null);
      alert(err.response?.data?.error?.message || "Failed to delete record.");
    }
  };

  const totalStock = stockItems.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="page-container">
      <PageHeader title="Stock Management" />
      <div className="page-content">
        
        <div className="kpi-grid">
          <KPICard 
            label="Total Purchases (Month)" 
            value={`₹${(summary?.totalPurchases || 0).toLocaleString()}`} 
            icon={<Receipt size={20} color="#059669" />}
            iconBg="#ecfdf5"
          />
          <KPICard
            label="GST Input Paid"
            value={<span style={{ color: "#d97706" }}>₹{(summary?.totalGstPaid || 0).toLocaleString()}</span>}
            icon={<BarChart size={20} color="#d97706" />}
            iconBg="#fffbeb"
          />
          <KPICard 
            label="Stock Alerts" 
            value={<span style={{ color: alerts.length > 0 ? "#dc2626" : "#6b7280" }}>{alerts.length} item(s)</span>} 
            icon={<AlertTriangle size={20} color="#dc2626" />}
            iconBg="#fef2f2"
          />
          <KPICard
            label="Total Stock Units"
            value={totalStock.toLocaleString()}
            icon={<Package size={20} color="#3b82f6" />}
            iconBg="#eff6ff"
          />
        </div>

        {alerts.length > 0 && (
          <div className="low-stock-alert-box">
            <h3>⚠️ Low Stock Alerts</h3>
            <div className="alert-items">
              {alerts.map((a) => (
                <div key={a._id} className="alert-item">
                  <span className="alert-name">{a.name}</span>
                  <span className="alert-sku">{a.sku}</span>
                  <span className="tag tag-red">{a.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary?.bySeller && Object.keys(summary.bySeller).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            {Object.entries(summary.bySeller).slice(0, 4).map(([seller, data]) => (
              <div key={seller} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', background: '#ede9fe', borderRadius: '8px' }}>
                    <Building2 size={16} color="#7c3aed" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{seller}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{data.entries} Purchase(s)</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#64748b' }}>Total Spent:</span>
                  <span style={{ fontWeight: 600 }}>₹{Math.round(data.total).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="toolbar">
          <h2 className="toolbar-title">Inventory Records</h2>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} style={{marginRight: 4}} /> Add New Stock
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px'}}>
                <h3 className="form-title" style={{margin: 0}}><Calculator size={18} style={{verticalAlign: 'middle', marginRight: 8, color: '#0d9488'}} />Record New Stock Purchase</h3>
                <button type="button" style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8'}} onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>

              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-group" style={{marginBottom: '20px'}}>
                  <label style={{fontSize: '13px', fontWeight: 600, color: '#475569'}}>Target Product *</label>
                  <select value={form.product} onChange={e => handleProductChange(e.target.value)} required style={{padding: '10px'}}>
                    <option value="">-- Choose Product to replenish --</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>

                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span style={{fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase'}}>Pricing Inputs (Enter any 2)</span>
                    {derivedField && <span style={{fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600}}>Auto-filling {derivedField === 'quantity' ? 'Qty' : 'Total'}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" value={form.quantity} onChange={e => handleFieldChange('quantity', e.target.value)} placeholder="Qty" className={derivedField === 'quantity' ? 'input-highlighted' : ''} style={derivedField === 'quantity' ? {background: '#f0fdf4', border: '1px solid #86efac'} : {}} />
                    </div>
                    <div className="form-group">
                      <label>Total Cost (Incl.)</label>
                      <input type="number" step="0.01" value={form.totalPrice} onChange={e => handleFieldChange('totalPrice', e.target.value)} placeholder="₹ Net Cost" style={derivedField === 'totalPrice' ? {background: '#f0fdf4', border: '1px solid #86efac'} : {}} />
                    </div>
                    <div className="form-group">
                      <label>Per Unit (Incl.)</label>
                      <input type="number" step="0.01" value={form.pricePerUnit} onChange={e => handleFieldChange('pricePerUnit', e.target.value)} placeholder="₹/Unit" style={derivedField === 'pricePerUnit' ? {background: '#f0fdf4', border: '1px solid #86efac'} : {}} />
                    </div>
                  </div>
                </div>

                <div className="form-row" style={{gap: '20px'}}>
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <div className="form-group">
                      <label>Seller Name (Optional)</label>
                      <input type="text" value={form.sellerName} onChange={e => setForm({...form, sellerName: e.target.value})} placeholder="Vendor name" />
                    </div>
                    <div className="form-group">
                      <label>Invoice #</label>
                      <input type="text" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} placeholder="Bill No. (Optional)" />
                    </div>
                  </div>
                  
                  <div style={{flex: 1, background: '#f1f5f9', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                     <span style={{fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px'}}>GST Settings</span>
                     
                     <div style={{display: 'flex', gap: '5px', marginBottom: '8px'}}>
                       <button type="button" onClick={() => setForm({...form, gstType: 'cgst_sgst'})} style={{flex: 1, fontSize: '13px', padding: '6px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #cbd5e1', background: form.gstType === 'cgst_sgst' ? '#0f172a' : 'white', color: form.gstType === 'cgst_sgst' ? 'white' : '#334155'}}>Local (C+S)</button>
                       <button type="button" onClick={() => setForm({...form, gstType: 'igst'})} style={{flex: 1, fontSize: '13px', padding: '6px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #cbd5e1', background: form.gstType === 'igst' ? '#0f172a' : 'white', color: form.gstType === 'igst' ? 'white' : '#334155'}}>Interstate (I)</button>
                     </div>

                     <select value={form.gstPercentage} onChange={e => setForm({...form, gstPercentage: Number(e.target.value)})} style={{width: '100%', padding: '6px', fontSize: '13px', borderRadius: '4px'}}>
                       {gstOptions.map(o => <option key={o} value={o}>{o}% GST Rate</option>)}
                     </select>

                     {fTotal > 0 && (
                       <div style={{marginTop: '10px', fontSize: '13px', background: 'white', padding: '8px', borderRadius: '5px', border: '1px dashed #cbd5e1'}}>
                         <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Base Val:</span><strong>₹{baseAmount.toFixed(2)}</strong></div>
                         <div style={{display: 'flex', justifyContent: 'space-between', color: '#b45309'}}><span>GST Amt:</span><strong>₹{gstAmount.toFixed(2)}</strong></div>
                       </div>
                     )}
                  </div>
                </div>

                {errorMsg && <p className="form-error" style={{marginTop: '10px'}}>{errorMsg}</p>}
                
                <div className="form-actions" style={{marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'}}>
                  <button type="button" className="modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-add" style={{background: '#0f172a', color: 'white'}}>Record Purchase</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '25px'}}>
          
          <div className="table-card">
            <div style={{padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{fontSize: '15px', fontWeight: 600, margin: 0, color: '#0f172a'}}>Recent Purchase Ledger</h3>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Seller</th>
                  <th>Qty</th>
                  <th>₹/Unit</th>
                  <th>Tax Breakup</th>
                  <th>Total (Incl)</th>
                  <th style={{textAlign: 'center'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan="8" className="tbl-empty"><Info size={20} style={{opacity: 0.5, marginBottom: 5}} /><br/>No Purchase History logged yet</td></tr>
                ) : (
                  entries.slice(0, 10).map((entry) => (
                    <tr key={entry._id}>
                      <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="td-bold">{entry.product?.name || "Deleted Product"}</td>
                      <td style={{fontSize: '13px', color: '#475569'}}>{entry.sellerName}</td>
                      <td><strong>{entry.quantity}</strong></td>
                      <td>₹{entry.purchasePrice?.toFixed(2)}</td>
                      <td>
                        <span style={{fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px'}}>
                          {entry.gstPercentage}% ({entry.gstType === 'igst' ? 'IGST' : 'C+S'})
                        </span>
                      </td>
                      <td className="td-bold" style={{color: '#059669'}}>₹{Math.round(entry.totalCost).toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => setDeleteConfirmId(entry._id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', opacity: 0.8 }}
                          title="Delete purchase entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-card">
            <div style={{padding: '15px 20px', borderBottom: '1px solid #f1f5f9'}}>
              <h3 style={{fontSize: '15px', fontWeight: 600, margin: 0, color: '#0f172a'}}>Live Stock Inventory</h3>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Units in Stock</th>
                  <th>Threshold</th>
                  <th>Unit Type</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.length === 0 ? (
                  <tr><td colSpan="6" className="tbl-empty">No current inventory levels available</td></tr>
                ) : (
                  stockItems.map((item) => (
                    <tr key={item._id}>
                      <td className="td-bold">{item.name}</td>
                      <td><span className="cat-tag">{item.sku}</span></td>
                      <td>{item.category?.name || "—"}</td>
                      <td>
                        <span className={`tag ${item.stock > item.lowStockThreshold ? "tag-green" : item.stock > 0 ? "tag-orange" : "tag-red"}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td style={{color: '#64748b'}}>{item.lowStockThreshold}</td>
                      <td>{item.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {deleteConfirmId && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', padding: '25px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b' }}>Reverse Stock Entry?</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px' }}>This will automatically subtract these items back out of your live inventory levels. Continue?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={triggerDeleteStock} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Yes, Reverse it</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
