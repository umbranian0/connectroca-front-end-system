import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/authApi';
import BrandLogo from '../components/BrandLogo';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await requestPasswordReset(email.trim());
      setSuccess('If the account exists, a password reset email was sent.');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to process request.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card figma-login-card">
        <div className="login-brand">
          <BrandLogo
            alt="ConnectTroca logo"
            className="brand-logo"
            loading="eager"
            decoding="async"
          />
          <div>
            <strong>ConnectTroca</strong>
            <small>Recover your account</small>
          </div>
        </div>

        <h1>Forgot Password</h1>
        <p>Enter your email and we will request a password reset.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="student@school.edu"
            required
          />

          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset request'}
          </button>
        </form>

        <p className="auth-signup-copy">
          Back to login? <Link className="auth-inline-link" to="/login">Login</Link>
        </p>

        {error ? <p className="status-error">{error}</p> : null}
        {success ? <p className="status-success">{success}</p> : null}
      </section>
    </div>
  );
}

export default ForgotPasswordPage;
