import { useState } from 'react';

export default function FlightsAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [flights, setFlights] = useState([
    { id: 101, flightNumber: 'AC102', airline: 'Air Canada', origin: 'YYT', destination: 'YYZ', gate: 'A2', status: 'ON TIME' },
    { id: 102, flightNumber: 'WS504', airline: 'WestJet', origin: 'YYT', destination: 'YHZ', gate: 'B1', status: 'BOARDING' },
    { id: 103, flightNumber: 'PD301', airline: 'Porter Airlines', origin: 'YUL', destination: 'YYT', gate: 'A4', status: 'DELAYED' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Flights</h1>
          <p className="page-subtitle">Configure flight schedules, routes, and operational statuses.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add New Flight
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="input-control"
            placeholder="Search by flight number..."
            style={{ width: '260px' }}
          />
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {flights.length} flights</span>
        </div>
      </div>

      {/* Flight Management Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flight ID</th>
              <th>Flight #</th>
              <th>Airline</th>
              <th>Route</th>
              <th>Gate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{f.id}</td>
                <td style={{ fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>{f.flightNumber}</td>
                <td>{f.airline}</td>
                <td>{f.origin} ➔ {f.destination}</td>
                <td><span className="user-badge">{f.gate}</span></td>
                <td>
                  <span className={`badge-status ${f.status.toLowerCase().replace(' ', '-')}`}>
                    <span className="badge-dot"></span>{f.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setFlights(flights.filter(item => item.id !== f.id))}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Flight Modal Skeleton */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: '#1e293b' }}>
            <h3 style={{ color: 'var(--text-h)', marginBottom: '1.25rem' }}>➕ Add New Flight</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label className="form-label">Flight Number</label>
                <input type="text" className="input-control" placeholder="e.g. AC990" required />
              </div>
              <div className="form-group">
                <label className="form-label">Airline</label>
                <input type="text" className="input-control" placeholder="e.g. Air Canada" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Origin (IATA)</label>
                  <input type="text" className="input-control" placeholder="YYT" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination (IATA)</label>
                  <input type="text" className="input-control" placeholder="YYZ" required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Flight</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

