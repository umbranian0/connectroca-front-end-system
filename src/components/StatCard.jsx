function StatCard({ icon, value, label }) {
  return (
    <article className="stat-card">
      <span className="stat-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}

export default StatCard;
