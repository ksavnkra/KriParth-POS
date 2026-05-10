import "./KPICard.css";

export default function KPICard({ label, value, icon, iconBg, className }) {
  return (
    <div className={`stat-card ${className || ""}`}>
      {icon && (
        <div
          className="stat-icon"
          style={{ backgroundColor: iconBg || "#e8f5e9" }}
        >
          {icon}
        </div>
      )}
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}
