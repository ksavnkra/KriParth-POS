import { useState, useEffect } from "react";
import API from "../../services/api";
import { Plus, Tag, Layers, Trash2, Edit2, Info } from "lucide-react";
import "../../styles/shared.css";
import PageHeader from "../../components/PageHeader/PageHeader";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setFormError("");
    setShowForm(false);
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description || "" });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Category Name is required.");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, formData);
      } else {
        await API.post("/categories", formData);
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "An error occurred while saving.");
    }
  };

  const triggerDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await API.delete(`/categories/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteConfirmId(null);
      alert("Failed to deactivate category.");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Categories" />
      <div className="page-content">
        
        <div className="toolbar" style={{ marginBottom: '25px' }}>
          <h2 className="toolbar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} color="#6366f1" />
            Manage Product Categories
          </h2>
          <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} style={{ marginRight: 4 }} /> New Category
          </button>
        </div>

        {/* Elevated Lightbox Modal for Comprehensive Metadata Entry */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '24px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <h3 className="form-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={18} color="#6366f1" />
                  {editingId ? "Update Category" : "Create New Category"}
                </h3>
                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }} onClick={resetForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Category Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Beverages, Electronics" 
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Description (Optional)</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Brief details about this grouping..." 
                    rows={3}
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                {formError && (
                  <p style={{ fontSize: '13px', color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2', margin: 0 }}>
                    {formError}
                  </p>
                )}

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                  <button type="button" className="modal-cancel" onClick={resetForm} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-add" style={{ flex: 2, background: '#0f172a', color: 'white', justifyContent: 'center' }}>
                    {editingId ? "Save Changes" : "Add Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Structure reusing common styles */}
        <div className="table-card" style={{ background: 'white', borderRadius: '18px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Category Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Description</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <Info size={24} style={{ opacity: 0.5, marginBottom: '8px' }} /><br />
                    No active categories found. Click 'New Category' to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tag size={16} color="#6366f1" />
                        </div>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                      {cat.description || <em style={{ opacity: 0.5 }}>No description set</em>}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEdit(cat)} 
                          style={{ background: 'none', border: 'none', color: '#64748b', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(cat._id)} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Fully isolated custom confirm modal */}
        {deleteConfirmId && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content" style={{ maxWidth: '400px', padding: '25px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b' }}>Deactivate Category?</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px' }}>Are you sure you want to remove this active category from list?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={triggerDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Yes, Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
