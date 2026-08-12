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
                <td>{a.model}</td>
                <td>{a.manufacturer}</td>
                <td>{a.capacity} seats</td>
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: '#1e293b' }}>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '1.25rem' }}>🛩️ Add New Aircraft</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Aircraft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

