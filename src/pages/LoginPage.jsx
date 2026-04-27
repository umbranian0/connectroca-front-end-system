import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname ?? '/activities';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!identifier || !password) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(identifier, password);
      const destination = location.state?.from?.pathname ?? '/activities';
      navigate(destination, { replace: true });
    } catch {
      // Error is stored in the auth context and rendered below.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <h1>Conectra Login</h1>
        <p>Authenticate against Strapi local auth to access users and activities pages.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="identifier">Email or username</label>
          <input
            id="identifier"
            type="text"
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="user@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
          />

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {error ? <p className="status-error">{error}</p> : null}
      </section>
    </div>
  );
}

export default LoginPage;
