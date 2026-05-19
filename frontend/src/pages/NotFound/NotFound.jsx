import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGoHome = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'cashier') {
      navigate('/pos');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-glow" />

        <div className="notfound-code">
          <span className="notfound-4">4</span>
          <div className="notfound-zero">
            <div className="notfound-zero-ring" />
            <span className="notfound-zero-icon">📦</span>
          </div>
          <span className="notfound-4">4</span>
        </div>

        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button className="notfound-btn" onClick={handleGoHome}>
          ← Back to {isAuthenticated ? (user?.role === 'cashier' ? 'POS' : 'Dashboard') : 'Login'}
        </button>

        <div className="notfound-footer">
          <span className="notfound-brand">KriParth POS</span>
        </div>
      </div>
    </div>
  );
}
