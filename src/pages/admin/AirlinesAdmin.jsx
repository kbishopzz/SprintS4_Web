import { useState } from 'react';

export default function AirlinesAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [airlines] = useState([
    { id: 1, code: 'AC', name: 'Air Canada', country: 'Canada', activeFlights: 24, status: 'PARTNER' },
    { id: 2, code: 'WS', name: 'WestJet', country: 'Canada', activeFlights: 16, status: 'PARTNER' },
    { id: 3, code: 'PD', name: 'Porter Airlines', country: 'Canada', activeFlights: 8, status: 'PARTNER' },
    { id: 4, code: 'PB', name: 'PAL Airlines', country: 'Canada', activeFlights: 6, status: 'REGIONAL' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Airlines</h1>
          <p className="page-subtitle">Register airline codes, partner agreements, and contact channels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Airline Partner
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>IATA Code</th>
              <th>Airline Name</th>
              <th>Country</th>
              <th>Active Daily Flights</th>
              <th>Agreement Tier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: '800', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>{a.code}</td>
                <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>{a.name}</td>
                <td>{a.country}</td>
                <td>{a.activeFlights} flights/day</td>
                <td>
                  <span className="badge-status active"><span className="badge-dot"></span>{a.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-secondary btn-sm">Details</button>
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
            <h3 style={{ color: 'var(--text-h)', marginBottom: '1.25rem' }}>🏢 Add Airline Partner</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">IATA Code</label>
                  <input type="text" className="input-control" placeholder="AC" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Airline Name</label>
                  <input type="text" className="input-control" placeholder="Air Canada" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country of Origin</label>
                <input type="text" className="input-control" placeholder="Canada" required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Airline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

