import { useState } from "react";
import PageHeader from "../../components/PageHeader/PageHeader";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Box from "../../components/Box/Box";
import "./Signup.css"; // We will create an advanced css file for this.

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cashier", contact: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  if (!user || user.role !== 'admin') return (
    <div className="page-container">
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h3>Access Restricted</h3>
        <p>Only administrators can access user creation.</p>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await API.post('/auth/register', form);
      setStatus({ type: "success", message: "🎉 User account created successfully!" });
      setTimeout(() => navigate('/users'), 1200);
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.error?.message || "Failed to create user. Please check credentials." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Add New User" />
      
      <div className="page-content centered-content">
        <div className="creation-envelope">
          <Box title="Register New System User" subtitle="Set up access and permissions for a new staff member.">
            
            <div className="user-design-header">
              <div className="u-avatar-circle">
                <span>👤</span>
              </div>
              <h3>Account Setup</h3>
              <p>Fill out the configuration below.</p>
            </div>

            <form onSubmit={handleSubmit} className="modern-auth-form">
              
              {status.message && (
                <div className={`status-alert alert-${status.type}`}>
                  {status.type === 'success' ? '✅' : '⚠️'} {status.message}
                </div>
              )}

              <div className="m-form-row">
                <div className="m-group">
                  <label>Full Name</label>
                  <div className="m-input-wrap">
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Rohan Sharma" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="m-group">
                  <label>Contact Number</label>
                  <div className="m-input-wrap">
                    <input 
                      type="text" 
                      placeholder="98765 43210" 
                      value={form.contact} 
                      onChange={(e) => setForm({ ...form, contact: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div className="m-group">
                <label>Official Email Address</label>
                <div className="m-input-wrap">
                  <input 
                    type="email" 
                    required 
                    placeholder="rohan@example.com" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
              </div>

              <div className="m-form-row">
                <div className="m-group">
                  <label>Account Password</label>
                  <div className="m-input-wrap">
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    />
                  </div>
                  <small className="hint-txt">Minimum 6 robust characters.</small>
                </div>

                <div className="m-group">
                  <label>Access Privileges</label>
                  <div className="m-input-wrap">
                    <select 
                      value={form.role} 
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="m-select"
                    >
                      <option value="cashier">Cashier (Counter Access)</option>
                      <option value="manager">Manager (Inventory/Reports)</option>
                      <option value="admin">Administrator (Full Root)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-action-boundary">
                <button 
                  type="submit" 
                  className={`btn-launch ${isLoading ? 'btn-loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Provisioning Account..." : "Generate User Access"}
                </button>
              </div>
            </form>

          </Box>
        </div>
      </div>
    </div>
  );
}
