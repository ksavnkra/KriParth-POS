import "./Box.css";

export default function Box({ children, title, subtitle, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="card-head">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <span className="card-sub">{subtitle}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
