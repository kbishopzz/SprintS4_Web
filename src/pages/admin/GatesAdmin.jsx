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
                  <span className="user-badge" style={{ fontWeight: '800', fontFamily: 'var(--font-mono)' }}>Gate {g.gateNumber}</span>
                </td>
                <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>{g.terminal}</td>
                <td>
                  {g.flightNumber !== 'None' ? (
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: '700' }}>✈️ {g.flightNumber}</span>
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: '#1e293b' }}>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '1.25rem' }}>🚪 Add Terminal Gate</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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

