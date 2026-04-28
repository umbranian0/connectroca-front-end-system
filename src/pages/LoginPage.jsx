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
    const destination = location.state?.from?.pathname ?? '/';
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
      const destination = location.state?.from?.pathname ?? '/';
      navigate(destination, { replace: true });
    } catch {
      // Auth error is rendered from context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card figma-login-card">
        <div className="login-brand">
          <span className="brand-mark">CT</span>
          <div>
            <strong>ConnectTroca</strong>
            <small>Partilhe conhecimento</small>
          </div>
        </div>

        <h1>Acesse a plataforma</h1>
        <p>Faça login ou registre-se para começar a construir seus projetos ainda hoje.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="identifier">E-mail</label>
          <input
            id="identifier"
            type="text"
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Digite seu e-mail"
            required
          />

          <div className="auth-label-row">
            <label htmlFor="password">Senha</label>
            <span>Esqueceu a senha?</span>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            required
          />

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-signup-copy">
          Ainda não tem uma conta? <strong>Inscreva-se</strong>
        </p>

        {error ? <p className="status-error">{error}</p> : null}
      </section>
    </div>
  );
}

export default LoginPage;
