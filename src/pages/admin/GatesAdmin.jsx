import { useState } from 'react';

export default function GatesAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [gates] = useState([
    { id: 1, gateNumber: 'A1', terminal: 'Terminal 1', flightNumber: 'AC102', status: 'OCCUPIED' },
    { id: 2, gateNumber: 'A2', terminal: 'Terminal 1', flightNumber: 'WS504', status: 'BOARDING' },
    { id: 3, gateNumber: 'B1', terminal: 'Terminal 2', flightNumber: 'None', status: 'AVAILABLE' },
    { id: 4, gateNumber: 'B2', terminal: 'Terminal 2', flightNumber: 'PD301', status: 'OCCUPIED' },
    { id: 5, gateNumber: 'C1', terminal: 'International', flightNumber: 'None', status: 'MAINTENANCE' },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return <span className="badge-status available"><span className="badge-dot"></span>Available</span>;
      case 'BOARDING': return <span className="badge-status boarding"><span className="badge-dot"></span>Boarding</span>;
      case 'OCCUPIED': return <span className="badge-status on-time"><span className="badge-dot"></span>Occupied</span>;
      default: return <span className="badge-status maintenance"><span className="badge-dot"></span>Maintenance</span>;
    }
  };

  const getGateCardColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'var(--sky-green-light)', border: 'rgba(34, 197, 94, 0.3)', color: 'var(--sky-green)' };
      case 'BOARDING': return { bg: 'var(--sky-blue-light)', border: 'rgba(59, 130, 246, 0.3)', color: 'var(--sky-blue)' };
      case 'OCCUPIED': return { bg: 'var(--sky-cyan-light)', border: 'rgba(6, 182, 212, 0.3)', color: 'var(--sky-cyan)' };
      default: return { bg: 'var(--sky-yellow-light)', border: 'rgba(234, 179, 8, 0.3)', color: 'var(--sky-yellow)' };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Gates</h1>
          <p className="page-subtitle">Terminal gate assignments, occupancy tracking, and jet bridge status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Gate
        </button>
      </div>

      {/* Gate Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-icon blue">🚪</div>
          <div className="metric-details">
            <span className="metric-value">{gates.length}</span>
            <span className="metric-label">Total Gates</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">✅</div>
          <div className="metric-details">
            <span className="metric-value">{gates.filter(g => g.status === 'AVAILABLE').length}</span>
            <span className="metric-label">Available</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">🔧</div>
          <div className="metric-details">
            <span className="metric-value">{gates.filter(g => g.status === 'MAINTENANCE').length}</span>
            <span className="metric-label">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Gate Status Mini-Cards Grid */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>🗺️ Gate Overview</h3>
        <div className="card-grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {gates.map((g) => {
            const colors = getGateCardColor(g.status);
            return (
              <div key={g.id} className="glass-card" style={{
                padding: '1rem',
                borderLeft: `4px solid ${colors.color}`,
                background: colors.bg,
                textAlign: 'center',
                transition: 'all 0.3s var(--ease)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: colors.color,
                  marginBottom: '0.4rem'
                }}>
                  Gate {g.gateNumber}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{g.terminal}</div>
                {g.flightNumber !== 'None' ? (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-h)' }}>
                    ✈️ {g.flightNumber}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No Flight</div>
                )}
                <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(g.status)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gate Details Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Gate #</th>
              <th>Terminal</th>
              <th>Current Flight Assignment</th>
              <th>Gate Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((g) => (
              <tr key={g.id}>
                <td>
                  <span style={{
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--sky-blue-light)',
                    color: 'var(--sky-blue)',
                    padding: '0.25rem 0.7rem',
                    borderRadius: 'var(--radius-xs)'
                  }}>Gate {g.gateNumber}</span>
                </td>
                <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>{g.terminal}</td>
                <td>
                  {g.flightNumber !== 'None' ? (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--sky-blue)', fontWeight: '700' }}>✈️ {g.flightNumber}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No Flight Assigned</span>
                  )}
                </td>
                <td>{getStatusBadge(g.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm">Assign Flight</button>
                    <button className="btn btn-secondary btn-sm">Toggle Status</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Gate Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header blue">
              <h3>🚪 Add Terminal Gate</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Gate Number / Designation</label>
                  <input type="text" className="input-control" placeholder="e.g. Gate A5" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Terminal</label>
                  <select className="input-control" defaultValue="Terminal 1">
                    <option value="Terminal 1">Terminal 1</option>
                    <option value="Terminal 2">Terminal 2</option>
                    <option value="International">International Concourse</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Gate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
