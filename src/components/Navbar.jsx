import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <header className="app-navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">✈️</div>
        <span>AeroPulse</span>
      </Link>

      <nav className="nav-links">
        <Link to="/" className={isActive('/')}>Flight Board</Link>
        <Link to="/booking" className={isActive('/booking')}>Book Flight</Link>
        <Link to="/my-bookings" className={isActive('/my-bookings')}>My Bookings</Link>
        <Link to="/check-in" className={isActive('/check-in')}>Check-In</Link>
        <Link to="/baggage" className={isActive('/baggage')}>Baggage</Link>
        <Link to="/checkout" className={isActive('/checkout')}>Checkout</Link>
        <Link to="/login" className={isActive('/login')}>Login</Link>
        <Link to="/admin" className={`${isActive('/admin')} admin-badge`}>Admin Dashboard</Link>
        <Link to="/admin/flights" className={isActive('/admin/flights')}>Flights</Link>
        <Link to="/admin/aircraft" className={isActive('/admin/aircraft')}>Aircraft</Link>
        <Link to="/admin/airlines" className={isActive('/admin/airlines')}>Airlines</Link>
        <Link to="/admin/gates" className={isActive('/admin/gates')}>Gates</Link>
      </nav>

      {isAuthenticated && (
        <div className="nav-user">
          <span className="user-badge">👤 Logged in as {user?.username || 'User'}</span>
          <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
        </div>
      )}
    </header>
  );
}

