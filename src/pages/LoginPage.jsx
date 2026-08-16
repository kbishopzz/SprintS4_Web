import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/ApiClient';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectPath   = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab]   = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('admin123');
  const [localError, setLocalError] = useState('');

  // Registration form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName]   = useState('');
  const [regUsername, setRegUsername]   = useState('');
  const [regEmail, setRegEmail]         = useState('');
  const [regPassword, setRegPassword]   = useState('password123');
  const [regError, setRegError]         = useState('');
  const [regSuccess, setRegSuccess]     = useState('');
  const [regLoading, setRegLoading]     = useState(false);

  const { login, loginDirect, isAuthenticated, user, logout, loading, authError } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim()) {
      setLocalError('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (success) {
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        const normUser = username.trim().toLowerCase();
        const isAdmin = ['admin', 'mreid', 'kbishop', 'crubia'].includes(normUser);
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regUsername.trim() || !regEmail.trim()) {
      setRegError('Username and email are required.');
      return;
    }

    setRegLoading(true);

    const payload = {
      username: regUsername.trim(),
      email: regEmail.trim(),
      firstName: regFirstName.trim() || regUsername.trim(),
      lastName: regLastName.trim() || '',
      passwordHash: regPassword.trim() || 'password123',
      role: 'CLIENT',
    };

    try {
      await userApi.create(payload);
      const fullNameDisplay = regFirstName.trim() ? `${regFirstName.trim()} ${regLastName.trim()}`.trim() : regUsername.trim();
      setRegSuccess(`Account successfully created for ${fullNameDisplay}! Logging you in...`);
      setTimeout(() => {
        loginDirect({
          username: payload.username,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: 'CLIENT',
        });
        navigate(redirectPath || '/');
      }, 1000);
    } catch (err) {
      console.error('[LoginPage] Register error:', err);
      loginDirect({
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: 'CLIENT',
      });
      navigate(redirectPath || '/');
    } finally {
      setRegLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="page-container" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="page-header-text">
          <h1>Login</h1>
          <p className="page-subtitle">Portal Authentication & Registration</p>
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className="glass-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', textAlign: 'center', background: 'var(--sky-blue-light)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-h)', fontWeight: 600 }}>
          💡 Admin Passwords: <code>admin123</code> | Client Passwords: <code>password123</code>
        </span>
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab('login')}
        >
          🔑 Log In
        </button>
        <button
          className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab('register')}
        >
          📝 Register New User
        </button>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {isAuthenticated ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="badge-status on-time" style={{ margin: '0 auto', padding: '0.4rem 1rem' }}>
              <span className="badge-dot"></span> Authenticated Session Active
            </div>
            <p style={{ color: 'var(--text-h)', fontSize: '1.05rem' }}>
              Logged in as <strong>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}</strong>
              <span className={`badge-status ${user?.role === 'ADMIN' ? 'on-time' : 'scheduled'}`} style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                Role: {user?.role || 'CLIENT'}
              </span>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {user?.role === 'ADMIN' && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin')}>
                  Go to Admin Dashboard
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
                View Flight Board
              </button>
              <button className="btn btn-danger btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        ) : activeTab === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {displayError && (
              <div className="badge-status cancelled" style={{ padding: '0.5rem 1rem', width: '100%', justifyContent: 'center' }}>
                ⚠️ {displayError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username-input" className="form-label">
                Username (Admin or Client):
              </label>
              <input
                id="username-input"
                type="text"
                className="input-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. MReid, Kbishop, or Alice"
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
                placeholder="admin123 or password123"
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

            {/* Admin Shortcuts */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Quick Admin Login Shortcuts (Password: <code>admin123</code>):
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['MReid', 'Kbishop', 'CRubia'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => { setUsername(name); setPassword('admin123'); }}
                  >
                    {name} (Admin)
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          /* Register Form with First & Last Name */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {regError && <div className="alert alert-error">{regError}</div>}
            {regSuccess && <div className="badge-status available" style={{ padding: '0.5rem 1rem' }}>{regSuccess}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Keith"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Pye"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Desired Username *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. kpye"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="input-control"
                placeholder="e.g. keith.pye@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-control"
                placeholder="password123"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Client user passwords default to <code>password123</code>.
              </span>
            </div>

            <button type="submit" className="btn btn-success" style={{ padding: '0.75rem' }} disabled={regLoading}>
              {regLoading ? 'Creating Account...' : '✨ Register New Client Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
