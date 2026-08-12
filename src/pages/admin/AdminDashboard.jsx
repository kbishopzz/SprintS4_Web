import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeGates, setActiveGates] = useState([
    { gate: 'Gate A1', flight: 'AC102', airline: 'Air Canada', status: 'BOARDING', dest: 'YYZ' },
    { gate: 'Gate A2', flight: 'WS504', airline: 'WestJet', status: 'ON TIME', dest: 'YHZ' },
    { gate: 'Gate B1', flight: 'PD301', airline: 'Porter Airlines', status: 'DELAYED', dest: 'YUL' },
    { gate: 'Gate B2', flight: 'None', airline: '—', status: 'AVAILABLE', dest: '—' },
  ]);

  return (
    <div className="page-container" style={{ gap: '2rem' }}>
      {/* Admin Title */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Admin Dashboard</h1>
          <p className="page-subtitle">Real-time gate management, flight scheduling, and airport fleet control panel.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/flights')}>
            ✈️ Manage Flights
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/gates')}>
            🚪 Manage Gates
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon indigo">✈️</div>
          <div className="metric-details">
            <span className="metric-value">142</span>
            <span className="metric-label">Scheduled Flights Today</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon cyan">🛩️</div>
          <div className="metric-details">
            <span className="metric-value">36</span>
            <span className="metric-label">Fleet Aircraft Active</span>
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

      {/* Operations Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card-accent" onClick={() => navigate('/admin/flights')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon blue">✈️</div>
            <span className="badge-status active">Operational</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Flight Schedule Console</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Create, update flight statuses (On Time, Delayed, Cancelled), and assign aircraft routes.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Flights Console ➔</button>
        </div>

        <div className="glass-card-accent" onClick={() => navigate('/admin/gates')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon cyan">🚪</div>
            <span className="badge-status boarding">Active Gates</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Terminal Gate Control</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Monitor terminal gate availability, jet bridge connections, and re-assign incoming flights.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Gate Control ➔</button>
        </div>

        <div className="glass-card-accent" onClick={() => navigate('/admin/aircraft')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon purple">🛩️</div>
            <span className="badge-status active">Fleet Ready</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Aircraft Fleet Register</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Track tail numbers, passenger seat capacity, and maintenance service logs.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Fleet Manager ➔</button>
        </div>

        <div className="glass-card-accent" onClick={() => navigate('/admin/airlines')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon emerald">🏢</div>
            <span className="badge-status active">Agreements OK</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Airline Partner Network</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Manage IATA airline codes, partner agreements, and contact channels.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Airline Network ➔</button>
        </div>
      </div>

      {/* Gate Status Table Summary */}
      <div className="table-container">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--text-h)', margin: 0 }}>🚪 Terminal 1 Gate Monitor</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/gates')}>View All Gates</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Gate Designation</th>
              <th>Current Flight</th>
              <th>Airline</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeGates.map((g, idx) => (
              <tr key={idx}>
                <td><strong style={{ color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>{g.gate}</strong></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-h)' }}>{g.flight}</td>
                <td>{g.airline}</td>
                <td>{g.dest}</td>
                <td>
                  <span className={`badge-status ${g.status.toLowerCase().replace(' ', '-')}`}>
                    <span className="badge-dot"></span>{g.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/gates')}>Manage Gate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
