import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError('Unexpected response.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <aside className="auth-highlight">
        <div className="auth-highlight__inner">
          <span className="auth-badge">NextGen Fusion Console</span>
          <h1>Integrated logistics, streamlined.</h1>
          <p>
            Manage consignments, monitor live statuses, and keep your customers informed from a single unified dashboard.
          </p>
          <ul>
            <li>Secure single sign-on for administrators</li>
            <li>Real-time shipment visibility</li>
            <li>Actionable insights for operations</li>
          </ul>
        </div>
      </aside>
      <main className="auth-form-wrapper" aria-live="polite">
        <form className="auth-card" onSubmit={onSubmit}>
          <header className="auth-card__header">
            <span className="auth-chip">Admin Login</span>
            <h2>Sign in to your workspace</h2>
            <p>Enter your credentials to access the shipment management dashboard.</p>
          </header>

          {error && (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="admin@example.com"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              className="auth-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          <button className="auth-submit" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>

          <footer className="auth-footer">
            <p>
              Tip: Ensure you have registered an admin via <code>/api/auth/register</code> before attempting to log in.
            </p>
          </footer>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
