import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, UserCog, Shield, ShieldCheck, User, Mail, Phone, Lock, ChevronDown, UserPlus, Info } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import API from '../../services/api';
import '../../styles/shared.css';
import './Admin.css';

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState(null);

  // Create User form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    role: 'cashier',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', contact: '', role: 'cashier' });
    setFormError('');
    setFormSuccess('');
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.email || !formData.password || !formData.contact) {
      setFormError('All fields are required');
      return;
    }

    try {
      setFormLoading(true);
      await API.post('/auth/register', formData);
      setFormSuccess('User created successfully!');
      setTimeout(() => {
        resetForm();
        fetchUsers();
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to create user';
      setFormError(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (id, isActive, userRole) => {
    // For non-admin users, just toggle directly (no confirmation needed)
    if (userRole === 'admin' && !isActive) {
      // Reactivating an admin — only another admin can do this, which is already enforced by the route
    }
    if (userRole === 'admin' && isActive) {
      // Deactivating admin — only self-deactivation allowed, handled by confirmation modal
      return;
    }
    try {
      await API.patch(`/users/${id}`, { isActive: !isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update user');
    }
  };

  const triggerDeactivateSelf = async () => {
    if (!deactivateConfirmId) return;
    try {
      await API.patch(`/users/${deactivateConfirmId}`, { isActive: false });
      setDeactivateConfirmId(null);
      // Log out since the account is now deactivated
      logout();
      navigate('/login');
    } catch (err) {
      setDeactivateConfirmId(null);
      alert(err.response?.data?.error?.message || 'Failed to deactivate account.');
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      await API.patch(`/users/${id}`, { role: newRole });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user role', err);
    }
  };

  const handleRoleChange = (userId, currentRole) => {
    setEditingId(userId);
    setEditingRole(currentRole);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={14} />;
      case 'manager': return <ShieldCheck size={14} />;
      default: return <User size={14} />;
    }
  };

  const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;

  // Sort: self user first, then rest
  const sortedUsers = [...users].sort((a, b) => {
    if (a._id === user?._id) return -1;
    if (b._id === user?._id) return 1;
    return 0;
  });

  return (
    <div className="page-container">
      <PageHeader title="Admin Panel" />
      <div className="page-content">

        <div className="toolbar">
          <h2 className="toolbar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCog size={22} color="#6366f1" />
            Manage Users
          </h2>
          <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Create User
          </button>
        </div>

        {/* Create User Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '24px', maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <h3 className="form-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={18} color="#5cb8a5" />
                  Create New User
                </h3>
                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }} onClick={resetForm}>✕</button>
              </div>

              <form className="product-form" onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#64748b" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="#64748b" /> Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#64748b" /> Contact *
                    </label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} color="#64748b" /> Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Set a password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} color="#64748b" /> Role
                    </label>
                    <select name="role" value={formData.role} onChange={handleInputChange}>
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <p className="form-error">{formError}</p>
                )}

                {formSuccess && (
                  <p style={{ fontSize: '13px', color: '#059669', background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0', margin: 0 }}>
                    {formSuccess}
                  </p>
                )}

                <div className="form-actions" style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                  <button type="button" className="modal-cancel" onClick={resetForm}>Cancel</button>
                  <button
                    type="submit"
                    className="btn-add"
                    disabled={formLoading}
                    style={{ background: '#0f172a', color: 'white', justifyContent: 'center' }}
                  >
                    {formLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="table-card" style={{ background: 'white', borderRadius: '18px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>User</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Role</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading users...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <Info size={24} style={{ opacity: 0.5, marginBottom: '8px' }} /><br />
                    No users found. Click 'Create User' to add one.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u) => {
                  const isSelf = u._id === user?._id;
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', background: isSelf ? '#f8fafc' : 'transparent' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="admin-user-avatar">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                              {u.name}
                              {isSelf && <span style={{ fontSize: '11px', color: '#6366f1', marginLeft: '6px', fontWeight: 500 }}>(You)</span>}
                            </span>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{u.contact}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {!isSelf && editingId === u._id ? (
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="admin-role-select"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="cashier">Cashier</option>
                          </select>
                        ) : (
                          <span className={`admin-role-badge admin-role-${u.role}`}>
                            {getRoleIcon(u.role)}
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span className={`tag ${u.isActive ? 'tag-green' : 'tag-red'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {isSelf ? (
                          /* Self admin: show Deactivate with confirmation */
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setDeactivateConfirmId(u._id)}
                              className="admin-action-btn admin-action-deactivate"
                              disabled={adminCount <= 1}
                              title={adminCount <= 1 ? 'Cannot deactivate — you are the only active admin' : 'Deactivate your account'}
                            >
                              Deactivate
                            </button>
                          </div>
                        ) : editingId === u._id ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => updateRole(u._id, editingRole)} className="admin-action-btn admin-action-save">
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="admin-action-btn admin-action-cancel">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleRoleChange(u._id, u.role)}
                              className="admin-action-btn admin-action-edit"
                              disabled={u.role === 'admin'}
                              title={u.role === 'admin' ? 'Cannot change admin role' : ''}
                            >
                              <ChevronDown size={14} /> Role
                            </button>
                            {u.role === 'admin' ? (
                              /* Other admins: only allow reactivation if they're inactive */
                              <button
                                onClick={() => toggleActive(u._id, u.isActive, u.role)}
                                className="admin-action-btn admin-action-activate"
                                disabled={u.isActive}
                                title={u.isActive ? 'Active admins can only deactivate themselves' : 'Reactivate this admin'}
                              >
                                {u.isActive ? 'Active' : 'Activate'}
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleActive(u._id, u.isActive, u.role)}
                                className={`admin-action-btn ${u.isActive ? 'admin-action-deactivate' : 'admin-action-activate'}`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Self-Deactivation Confirmation Modal */}
        {deactivateConfirmId && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content" style={{ maxWidth: '420px', padding: '25px', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#1e293b' }}>Deactivate Your Account?</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px', lineHeight: '1.5' }}>
                You will be logged out immediately. Only another admin can reactivate your account.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setDeactivateConfirmId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button onClick={triggerDeactivateSelf} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Yes, Deactivate</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
