import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path ? 'admin-nav-item active' : 'admin-nav-item';

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">✈️</div>
          <span className="brand-title">SkyOps Control</span>
          <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
            {collapsed ? '➔' : '◀'}
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-group-title">Operations</div>
          <Link to="/admin" className={isActive('/admin')}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/admin/flights" className={isActive('/admin/flights')}>
            <span className="nav-icon">✈️</span>
            <span className="nav-text">Flights</span>
          </Link>
          <Link to="/admin/gates" className={isActive('/admin/gates')}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Gates</span>
          </Link>

          <div className="menu-group-title">Fleet & Management</div>
          <Link to="/admin/aircraft" className={isActive('/admin/aircraft')}>
            <span className="nav-icon">🛩️</span>
            <span className="nav-text">Aircraft Fleet</span>
          </Link>
          <Link to="/admin/airlines" className={isActive('/admin/airlines')}>
            <span className="nav-icon">🏢</span>
            <span className="nav-text">Partner Airlines</span>
          </Link>

          <div className="menu-group-title">Portal</div>
          <Link to="/" className="admin-nav-item">
            <span className="nav-icon">🌐</span>
            <span className="nav-text">Public Portal</span>
          </Link>

          <div className="menu-group-title">System</div>
          <Link to="/admin/users" className={isActive('/admin/users')}>
            <span className="nav-icon">👥</span>
            <span className="nav-text">User Management</span>
          </Link>
        </nav>

        <div className="sidebar-user-footer">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'Admin Staff'}</div>
            <div className="user-role">Airline Operations</div>
          </div>
          <button className="btn-icon" onClick={() => logout()} title="Logout"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search flights, aircraft, gates..." />
          </div>

          <div className="topbar-actions">
            <div className="status-badge live">
              <span className="pulse-dot"></span>
              <span>Live Terminal Feed</span>
            </div>
            <button className="btn-icon notif-badge" title="Notifications">🔔</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
              Public Portal ➔
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
