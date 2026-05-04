import "./PageHeader.css";

export default function PageHeader({ title }) {
  const current = new Date();
  const date = current.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="heading-top">
      {title}
      <div className="text-small">{date}</div>
      <br />
    </div>
  );
}
