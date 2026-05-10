import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import API from '../../services/api';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
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

  return (
    <div className="page-container">
      <PageHeader title="Users" />
      <div className="page-content">
        <div className="users-list">
          {users.map(u => (
            <div key={u._id} className="user-row">
              <div>
                <div className="user-name">{u.name} <small>({u.role})</small></div>
                <div className="user-meta">{u.email} · {u.contact}</div>
              </div>
              <div>
                <button onClick={() => toggleActive(u._id, u.isActive)} className={`btn ${u.isActive ? 'btn-danger' : 'btn-add'}`}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
