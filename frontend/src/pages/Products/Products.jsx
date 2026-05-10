import { useState, useEffect } from "react";
import API from "../../services/api";
import "./Products.css";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", sku: "", description: "", price: "", costPrice: "",
    stock: "", lowStockThreshold: "5", unit: "piece", category: "",
  });
  const [formError, setFormError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products", { params: { limit: 100, search: searchQuery } });
      setProducts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      name: "", sku: "", description: "", price: "", costPrice: "",
      stock: "", lowStockThreshold: "5", unit: "piece", category: "",
    });
    setEditingId(null);
    setFormError("");
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      price: String(product.price),
      costPrice: String(product.costPrice),
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold),
      unit: product.unit,
      category: product.category?._id || product.category || "",
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.sku) {
      setFormError("Name and SKU are required.");
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      stock: parseInt(formData.stock) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
    };

    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
      } else {
        await API.post("/products", payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "Failed to save product.");
    }
  };

  const triggerDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await API.delete(`/products/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteConfirmId(null);
      alert("Could not delete product. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Products" />
      <div className="page-content">
        <div className="toolbar">
          <div className="searchbox">
            <span className="searchbox-icon">🔍</span>
            <input
              type="text"
              className="searchbox-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Product
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px'}}>
                <h3 className="form-title" style={{ margin: 0 }}>{editingId ? "Edit Product" : "Add New Product"}</h3>
                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={resetForm}>✕</button>
              </div>

              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" />
                  </div>
                  <div className="form-group">
                    <label>SKU *</label>
                    <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. PROD-001" disabled={!!editingId} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Selling Price (₹)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" min="0" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <input 
                      type="text" 
                      list="unitList" 
                      value={formData.unit} 
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                      placeholder="e.g. piece, kg, set" 
                    />
                    <datalist id="unitList">
                      <option value="piece" />
                      <option value="kg" />
                      <option value="liter" />
                      <option value="pack" />
                      <option value="set" />
                      <option value="box" />
                    </datalist>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Low Stock Threshold</label>
                    <input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} placeholder="5" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label-optional">Category (optional)</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && <p className="form-error">{formError}</p>}

                <div className="form-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                  <button type="button" className="modal-cancel" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn-add" style={{ background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{editingId ? "Update" : "Add Product"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="tbl-empty">No products found. Add your first product!</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-icon">📦</div>
                        <div>
                          <div className="prod-name">{product.name}</div>
                          <div className="prod-unit">{product.sku} · {product.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cat-tag">{product.category?.name || "—"}</span>
                    </td>
                    <td className="td-bold">₹{product.price}</td>
                    <td>
                      <span className={`tag ${product.stock > product.lowStockThreshold ? "tag-green" : product.stock > 0 ? "tag-orange" : "tag-red"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" aria-label="Edit product" onClick={() => handleEdit(product)}>
                          ✏️
                        </button>
                        <button className="icon-btn icon-btn-danger" aria-label="Delete product" onClick={() => setDeleteConfirmId(product._id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Fully isolated custom confirm modal bypassing browser dialog restrictions */}
        {deleteConfirmId && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', padding: '25px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b' }}>Delete Product?</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px' }}>This will deactivate this product list entry permanently. Continue?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={triggerDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
