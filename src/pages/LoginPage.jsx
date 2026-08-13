import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, loginDirect, isAuthenticated, user, logout, loading, authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim()) {
      setLocalError('Please enter a valid username.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (success) {
      navigate('/admin');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="page-container" style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="page-header-text">
          <h1>Login</h1>
          <p className="page-subtitle">Admin Login</p>
        </div>
      </div>

      {/* Keycloak Provider Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <span className="badge-status scheduled" style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
          <span>🔐</span> Keycloak Authentication Provider
        </span>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {isAuthenticated ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="badge-status on-time" style={{ margin: '0 auto', padding: '0.4rem 1rem' }}>
              <span className="badge-dot"></span> Authenticated Session Active
            </div>
            <p style={{ color: 'var(--text-h)', fontSize: '1.05rem' }}>
              Logged in as <strong>{user?.username || 'Admin'}</strong>
              {user?.role && (
                <span className="badge-status on-time" style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                  {user.role}
                </span>
              )}
            </p>
            {user?.provider === 'keycloak' && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                🔐 Authenticated via Keycloak
              </p>
            )}
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
            {displayError && (
              <div className="badge-status cancelled" style={{ padding: '0.5rem 1rem', width: '100%', justifyContent: 'center' }}>
                ⚠️ {displayError}
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
                placeholder="e.g. MReid"
                required
                disabled={loading}
                autoComplete="username"
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
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? '⏳ Authenticating...' : '🔑 Log In to Portal'}
            </button>
          </form>
        )}
      </div>

      {!isAuthenticated && (
        <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textAlign: 'center' }}>
            💡 <strong>Admin Accounts</strong> — Password: <code>admin123</code>
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['MReid', 'Kbishop', 'CRubia'].map((name) => (
              <button
                key={name}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                onClick={() => { setUsername(name); setPassword('admin123'); }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
