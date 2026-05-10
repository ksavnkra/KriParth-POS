import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import API from '../../services/api';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

  useEffect(() => { fetchUsers(); }, []);

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

  const toggleActive = async (id, isActive) => {
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
      <PageHeader title="Manage Users" />
      <div className="page-content">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-list">
            {users.length === 0 ? (
              <div className="empty-state">No users found</div>
            ) : (
              <div className="users-table">
                <div className="users-header">
                  <div className="col-name">Name</div>
                  <div className="col-email">Email</div>
                  <div className="col-role">Role</div>
                  <div className="col-status">Status</div>
                  <div className="col-actions">Actions</div>
                </div>
                {users.map(u => (
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
                            onClick={() => toggleActive(u._id, u.isActive)} 
                            className={`btn ${u.isActive ? 'btn-danger' : 'btn-add'}`}
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
      </div>
    </div>
  );
}
