import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setError('');

    // Log in user via AuthContext
    login({ username: username.trim(), email: `${username.trim()}@airport.com` }, 'sample-token-123');
    navigate('/admin');
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Login</h1>
      <p>Admin Login</p>

      {isAuthenticated ? (
        <div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', padding: '1rem', borderRadius: '4px' }}>
          <p>You are logged in as <strong>{user?.username || 'Admin'}</strong>.</p>
          <button onClick={() => navigate('/admin')} style={{ marginRight: '0.5rem' }}>
            Go to Admin Dashboard
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ color: 'red' }}>{error}</div>}

          <div>
            <label htmlFor="username-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Username:
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div>
            <label htmlFor="password-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Password:
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer' }}>
            Log In
          </button>
        </form>
      )}
    </div>
  );
}
