import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <h1>Page not found</h1>
        <p>The requested route does not exist in this frontend.</p>
        <Link to="/" className="button button-primary">
          Go to dashboard
        </Link>
      </section>
    </div>
  );
}

export default NotFoundPage;
