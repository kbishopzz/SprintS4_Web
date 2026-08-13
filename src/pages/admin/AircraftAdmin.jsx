import { useState } from 'react';

export default function AircraftAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [fleet] = useState([
    { id: 1, tailNumber: 'C-FJZU', model: 'Boeing 737 MAX 8', manufacturer: 'Boeing', capacity: 189, status: 'ACTIVE' },
    { id: 2, tailNumber: 'C-GHPQ', model: 'Airbus A320neo', manufacturer: 'Airbus', capacity: 165, status: 'ACTIVE' },
    { id: 3, tailNumber: 'C-FDKL', model: 'De Havilland Dash 8-Q400', manufacturer: 'Bombardier', capacity: 78, status: 'MAINTENANCE' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Aircraft</h1>
          <p className="page-subtitle">Monitor fleet inventory, passenger capacity, and maintenance status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Aircraft
        </button>
      </div>

      {/* Fleet Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-icon blue">🛩️</div>
          <div className="metric-details">
            <span className="metric-value">{fleet.length}</span>
            <span className="metric-label">Total Fleet Size</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">✅</div>
          <div className="metric-details">
            <span className="metric-value">{fleet.filter(a => a.status === 'ACTIVE').length}</span>
            <span className="metric-label">Active Aircraft</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">🔧</div>
          <div className="metric-details">
            <span className="metric-value">{fleet.filter(a => a.status === 'MAINTENANCE').length}</span>
            <span className="metric-label">In Maintenance</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tail #</th>
              <th>Model</th>
              <th>Manufacturer</th>
              <th>Passenger Capacity</th>
              <th>Operational Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>{a.tailNumber}</td>
                <td style={{ fontWeight: 600 }}>{a.model}</td>
                <td>{a.manufacturer}</td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--sky-blue)',
                    fontSize: '1.05rem'
                  }}>{a.capacity}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>seats</span>
                </td>
                <td>
                  <span className={`badge-status ${a.status === 'ACTIVE' ? 'active' : 'maintenance'}`}>
                    <span className="badge-dot"></span>{a.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-secondary btn-sm">Logs</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Aircraft Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header green">
              <h3>🛩️ Add New Aircraft</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Tail / Registration Number</label>
                  <input type="text" className="input-control" placeholder="e.g. C-FKLA" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Aircraft Model</label>
                  <input type="text" className="input-control" placeholder="e.g. Airbus A321LR" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer</label>
                    <input type="text" className="input-control" placeholder="Airbus" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seat Capacity</label>
                    <input type="number" className="input-control" placeholder="180" required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Save Aircraft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
