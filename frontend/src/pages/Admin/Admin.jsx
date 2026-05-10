import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import API from '../../services/api';
import './Admin.css';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'create'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

  // Create User form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    role: 'cashier',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch users when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchUsers();
    }
  }, [activeTab]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });

    if (!formData.name || !formData.email || !formData.password || !formData.contact) {
      setFormMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setFormLoading(true);
      const res = await API.post('/auth/register', formData);
      setFormMessage({ type: 'success', text: 'User created successfully!' });
      setFormData({
        name: '',
        email: '',
        password: '',
        contact: '',
        role: 'cashier',
      });
      // Refresh users list
      setTimeout(() => {
        fetchUsers();
        setActiveTab('manage');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to create user';
      setFormMessage({ type: 'error', text: errorMsg });
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (id, isActive, userRole) => {
    // Prevent admin from deactivating themselves
    if (user?._id === id) {
      alert("You cannot deactivate your own account");
      return;
    }

    // Prevent deactivating other admins
    if (userRole === 'admin') {
      alert("You cannot deactivate other admin accounts");
      return;
    }

    try {
      await API.patch(`/users/${id}`, { isActive: !isActive });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user', err);
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

  return (
    <div className="page-container">
      <PageHeader title="Admin Panel" />
      <div className="page-content">
        <div className="admin-container">
          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              Manage Users
            </button>
            <button
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create User
            </button>
          </div>

          <div className="admin-content">
            {activeTab === 'manage' && (
              <div className="manage-users-section">
                <h2>Manage Users</h2>
                {loading ? (
                  <div className="loading">Loading users...</div>
                ) : users.filter(u => u._id !== user?._id).length === 0 ? (
                  <div className="empty-state">No other users found</div>
                ) : (
                  <div className="users-table">
                    <div className="users-header">
                      <div className="col-name">Name</div>
                      <div className="col-email">Email</div>
                      <div className="col-role">Role</div>
                      <div className="col-status">Status</div>
                      <div className="col-actions">Actions</div>
                    </div>
                    {users.filter(u => u._id !== user?._id).map(u => (
                      <div key={u._id} className="user-row">
                        <div className="col-name">
                          <div className="user-name">{u.name}</div>
                          <div className="user-contact">{u.contact}</div>
                        </div>
                        <div className="col-email">{u.email}</div>
                        <div className="col-role">
                          {editingId === u._id ? (
                            <select 
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                              className="role-select"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="cashier">Cashier</option>
                            </select>
                          ) : (
                            <span className={`role-badge role-${u.role}`}>{u.role}</span>
                          )}
                        </div>
                        <div className="col-status">
                          <span className={`status-badge ${u.isActive ? 'status-active' : 'status-inactive'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="col-actions">
                          {editingId === u._id ? (
                            <div className="action-buttons">
                              <button 
                                onClick={() => updateRole(u._id, editingRole)} 
                                className="btn btn-save"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setEditingId(null)} 
                                className="btn btn-cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button 
                                onClick={() => handleRoleChange(u._id, u.role)} 
                                className="btn btn-edit"
                              >
                                Change Role
                              </button>
                              <button 
                                onClick={() => toggleActive(u._id, u.isActive, u.role)} 
                                className={`btn ${u.isActive ? 'btn-danger' : 'btn-add'}`}
                                disabled={u.role === 'admin'}
                                title={u.role === 'admin' ? 'Cannot deactivate admin accounts' : ''}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div className="create-user-section">
                <h2>Create New User</h2>
                <form onSubmit={handleCreateUser} className="create-user-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact">Contact Number *</label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>

                  {formMessage.text && (
                    <div className={`form-message message-${formMessage.type}`}>
                      {formMessage.text}
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={formLoading}>
                    {formLoading ? 'Creating...' : 'Create User'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
