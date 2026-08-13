import { useState } from 'react';

export default function FlightsAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [flights, setFlights] = useState([
    { id: 101, flightNumber: 'AC102', airline: 'Air Canada', origin: 'YYT', destination: 'YYZ', gate: 'A2', status: 'ON TIME' },
    { id: 102, flightNumber: 'WS504', airline: 'WestJet', origin: 'YYT', destination: 'YHZ', gate: 'B1', status: 'BOARDING' },
    { id: 103, flightNumber: 'PD301', airline: 'Porter Airlines', origin: 'YUL', destination: 'YYT', gate: 'A4', status: 'DELAYED' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredFlights = flights.filter(f => {
    const matchesSearch = f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.airline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-icon blue">✈️</div>
          <div className="metric-details">
            <span className="metric-value">{flights.length}</span>
            <span className="metric-label">Total Flights</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">✅</div>
          <div className="metric-details">
            <span className="metric-value">{flights.filter(f => f.status === 'ON TIME').length}</span>
            <span className="metric-label">On Time</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">⏳</div>
          <div className="metric-details">
            <span className="metric-value">{flights.filter(f => f.status === 'DELAYED').length}</span>
            <span className="metric-label">Delayed</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="input-control"
            placeholder="Search by flight number or airline..."
            style={{ width: '280px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-right">
          <button className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>All</button>
          <button className={`filter-pill ${statusFilter === 'ON TIME' ? 'active' : ''}`} onClick={() => setStatusFilter('ON TIME')}>On Time</button>
          <button className={`filter-pill ${statusFilter === 'BOARDING' ? 'active' : ''}`} onClick={() => setStatusFilter('BOARDING')}>Boarding</button>
          <button className={`filter-pill ${statusFilter === 'DELAYED' ? 'active' : ''}`} onClick={() => setStatusFilter('DELAYED')}>Delayed</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {filteredFlights.length} flights</span>
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
            {filteredFlights.map((f) => (
              <tr key={f.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{f.id}</td>
                <td style={{ fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>{f.flightNumber}</td>
                <td style={{ fontWeight: 600 }}>{f.airline}</td>
                <td>{f.origin} ➔ {f.destination}</td>
                <td><span className="user-badge" style={{ fontWeight: 700, background: 'var(--sky-blue-light)', color: 'var(--sky-blue)' }}>Gate {f.gate}</span></td>
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
        {filteredFlights.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">✈️</div>
            <div className="empty-state-title">No flights found</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add Flight Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header blue">
              <h3>✈️ Add New Flight</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              </div>
              <div className="modal-footer">
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
