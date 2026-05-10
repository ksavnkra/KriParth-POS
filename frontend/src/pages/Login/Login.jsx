import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import FloatingLines from "../../components/FloatingLines/FloatingLines";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const BG_GRADIENT = ["#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];
const BG_WAVES = ["top", "middle", "bottom"];
const BG_LINE_COUNT = [8, 6, 10];
const BG_LINE_DISTANCE = [4, 3, 5];

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <FloatingLines
          linesGradient={BG_GRADIENT}
          enabledWaves={BG_WAVES}
          lineCount={BG_LINE_COUNT}
          lineDistance={BG_LINE_DISTANCE}
          animationSpeed={0.8}
          interactive={true}
          parallax={true}
          parallaxStrength={0.15}
          mixBlendMode="normal"
        />
      </div>

      <div className="login-noise" />

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-card-highlight" />

          <div className="login-brand">
            <img
              src="/logoWithText.png"
              alt="KriParth POS"
              className="login-logo"
            />
          </div>

          <form className="login-form" onSubmit={handleSubmit} id="login-form">
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-input-group">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" id="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`login-btn ${loading ? "login-btn-loading" : ""}`}
              id="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="login-footer">
            Secure access for authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
