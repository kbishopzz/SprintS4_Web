import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  const handleAdminPortalClick = () => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/login?redirect=/admin');
    }
  };

  return (
    <div className="public-shell">
      <header className="app-navbar">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🛫</div>
          <span>AeroPulse</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={isActive('/')}>Flight Board</Link>
          <Link to="/booking" className={isActive('/booking')}>Book Flight</Link>
          <Link to="/check-in" className={isActive('/check-in')}>Self Check-In</Link>
          <Link to="/baggage" className={isActive('/baggage')}>Track Baggage</Link>
          <Link to="/my-bookings" className={isActive('/my-bookings')}>My Trips</Link>
        </nav>

        <div className="nav-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAuthenticated && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Logged in: <strong>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}</strong> ({user?.role || 'CLIENT'})
            </span>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleAdminPortalClick}>
            Admin Portal Login 🔒
          </button>
          {isAuthenticated && (
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="public-main">
        {children}
      </main>

      <Footer />
    </div>
  );
}
