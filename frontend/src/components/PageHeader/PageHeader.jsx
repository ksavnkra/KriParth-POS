import "./PageHeader.css";

export default function PageHeader({ title }) {
  const current = new Date();
  const date = current.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="pg-header">
      <div>
        <h1 className="pg-title">{title}</h1>
        <span className="pg-date">{date}</span>
      </div>
    </div>
  );
}
