import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Admin Dashboard</h1>
          <p className="page-subtitle">Centralized Airport & Flight Management Control Panel</p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon indigo">✈️</div>
          <div className="metric-details">
            <span className="metric-value">142</span>
            <span className="metric-label">Total Flights Managed</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon cyan">🛩️</div>
          <div className="metric-details">
            <span className="metric-value">36</span>
            <span className="metric-label">Active Fleet Aircraft</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon emerald">🏢</div>
          <div className="metric-details">
            <span className="metric-value">12</span>
            <span className="metric-label">Partner Airlines</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon amber">🚪</div>
          <div className="metric-details">
            <span className="metric-value">18</span>
            <span className="metric-label">Terminal Gates</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>✈️</div>
          <div>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '0.4rem' }}>Manage Flights</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create, schedule, update status, and assign gates to active flights.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/flights')}>Open Flights Console ➔</button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🛩️</div>
          <div>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '0.4rem' }}>Manage Aircraft</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monitor fleet inventory, passenger capacity, and maintenance schedules.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/aircraft')}>Open Fleet Console ➔</button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🏢</div>
          <div>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '0.4rem' }}>Manage Airlines</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Register airline codes, contact info, and partner agreements.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/airlines')}>Open Airlines Console ➔</button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🚪</div>
          <div>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '0.4rem' }}>Manage Gates</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assign terminal gates, manage availability, and handle jet bridge ops.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/gates')}>Open Gates Console ➔</button>
        </div>
      </div>
    </div>
  );
}

