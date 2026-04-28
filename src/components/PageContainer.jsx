function PageContainer({ title, description, actions = null, children }) {
  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>

        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}

export default PageContainer;
