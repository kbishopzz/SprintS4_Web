import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeGates] = useState([
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
        <div className="metric-card blue">
          <div className="metric-icon blue">✈️</div>
          <div className="metric-details">
            <span className="metric-value">142</span>
            <span className="metric-label">Scheduled Flights Today</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">🛩️</div>
          <div className="metric-details">
            <span className="metric-value">36</span>
            <span className="metric-label">Fleet Aircraft Active</span>
          </div>
        </div>
        <div className="metric-card purple">
          <div className="metric-icon purple">🏢</div>
          <div className="metric-details">
            <span className="metric-value">12</span>
            <span className="metric-label">Partner Airlines</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">🚪</div>
          <div className="metric-details">
            <span className="metric-value">18</span>
            <span className="metric-label">Terminal Gates</span>
          </div>
        </div>
      </div>

      {/* Status Summary Strip */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sky-green)', fontFamily: 'var(--font-heading)' }}>87%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>On-Time Rate</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>24</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Currently Boarding</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sky-yellow)', fontFamily: 'var(--font-heading)' }}>5</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Delayed Flights</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sky-red)', fontFamily: 'var(--font-heading)' }}>1</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cancelled</div>
        </div>
      </div>

      {/* Operations Quick Action Grid */}
      <div className="card-grid-4">
        <div className="glass-card-accent" onClick={() => navigate('/admin/flights')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon blue">✈️</div>
            <span className="badge-status active"><span className="badge-dot"></span>Operational</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Flight Schedule</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Create, update statuses, and assign aircraft routes.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Console ➔</button>
        </div>

        <div className="glass-card-accent" onClick={() => navigate('/admin/gates')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon cyan">🚪</div>
            <span className="badge-status boarding"><span className="badge-dot"></span>Active</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Gate Control</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Monitor gate availability and jet bridge connections.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Control ➔</button>
        </div>

        <div className="glass-card-accent" onClick={() => navigate('/admin/aircraft')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon green">🛩️</div>
            <span className="badge-status active"><span className="badge-dot"></span>Fleet Ready</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Aircraft Fleet</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Track tail numbers, capacity, and maintenance logs.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Fleet ➔</button>
        </div>

        <div className="glass-card-accent" onClick={() => navigate('/admin/airlines')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon purple">🏢</div>
            <span className="badge-status active"><span className="badge-dot"></span>OK</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: '0.4rem' }}>Airline Partners</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Manage IATA codes, agreements, and contacts.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Open Network ➔</button>
        </div>
      </div>

      {/* Gate Status Table Summary */}
      <div className="table-container">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="metric-icon cyan" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>🚪</div>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Terminal 1 Gate Monitor</h3>
          </div>
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
                <td><strong style={{ color: 'var(--sky-blue)', fontFamily: 'var(--font-mono)' }}>{g.gate}</strong></td>
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
