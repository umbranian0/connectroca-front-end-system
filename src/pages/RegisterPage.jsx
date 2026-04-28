import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { registerUserAccount } from '../api/authApi';
import { useAuth } from '../features/auth/useAuth';

function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [username, email, password, confirmPassword]);

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname ?? '/';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must have at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await registerUserAccount(
        {
          username: username.trim(),
          email: email.trim(),
          password,
        },
        token,
      );

      setSuccess('Account created successfully. Redirecting to login...');

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            registeredEmail: email.trim(),
          },
        });
      }, 900);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to create account.';
      setError(message);
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
            <small>Create your account</small>
          </div>
        </div>

        <h1>Create Account</h1>
        <p>Register a new user account to access the platform.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="student_user"
            required
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="student@school.edu"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            required
          />

          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
            required
          />

          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-signup-copy">
          Already have an account? <Link className="auth-inline-link" to="/login">Login</Link>
        </p>

        {error ? <p className="status-error">{error}</p> : null}
        {success ? <p className="status-success">{success}</p> : null}
      </section>
    </div>
  );
}

export default RegisterPage;
