import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    setError('');

    // Log in user via AuthContext
    login({ username: username.trim(), email: `${username.trim()}@airport.com` }, 'sample-token-123');
    navigate('/admin');
  };

  return (
    <div className="page-container" style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="page-header-text">
          <h1>Login</h1>
          <p className="page-subtitle">Admin Login</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {isAuthenticated ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="badge-status on-time" style={{ margin: '0 auto', padding: '0.4rem 1rem' }}>
              <span className="badge-dot"></span> Authenticated Session Active
            </div>
            <p style={{ color: 'var(--text-h)', fontSize: '1.05rem' }}>
              Logged in as <strong>{user?.username || 'Admin'}</strong>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin')}>
                Go to Admin Dashboard
              </button>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="badge-status cancelled" style={{ padding: '0.5rem 1rem', width: '100%', justifyContent: 'center' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username-input" className="form-label">
                Username:
              </label>
              <input
                id="username-input"
                type="text"
                className="input-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password-input" className="form-label">
                Password:
              </label>
              <input
                id="password-input"
                type="password"
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
              🔑 Log In to Portal
            </button>
          </form>
        )}
      </div>

      {!isAuthenticated && (
        <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Demo Admin Account: Username <strong>admin</strong> (Any password)
          </span>
        </div>
      )}
    </div>
  );
}

