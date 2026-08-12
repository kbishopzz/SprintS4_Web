import { useState } from 'react';

export default function HomePage() {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const mockFlights = [
    { id: 1, flightNumber: 'AC102', airline: 'Air Canada', origin: 'YYT (St. Johns)', destination: 'YYZ (Toronto)', scheduled: '08:30', gate: 'A2', status: 'ON TIME' },
    { id: 2, flightNumber: 'WS504', airline: 'WestJet', origin: 'YYT (St. Johns)', destination: 'YHZ (Halifax)', scheduled: '09:15', gate: 'B1', status: 'BOARDING' },
    { id: 3, flightNumber: 'PD301', airline: 'Porter Airlines', origin: 'YUL (Montreal)', destination: 'YYT (St. Johns)', scheduled: '10:00', gate: 'A4', status: 'DELAYED' },
    { id: 4, flightNumber: 'AC880', airline: 'Air Canada', origin: 'YYT (St. Johns)', destination: 'LHR (London)', scheduled: '11:45', gate: 'C3', status: 'SCHEDULED' },
    { id: 5, flightNumber: 'PAL10', airline: 'PAL Airlines', origin: 'YDF (Deer Lake)', destination: 'YYT (St. Johns)', scheduled: '12:30', gate: 'B3', status: 'ON TIME' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ON TIME': return 'badge-status on-time';
      case 'BOARDING': return 'badge-status boarding';
      case 'DELAYED': return 'badge-status delayed';
      case 'CANCELLED': return 'badge-status cancelled';
      default: return 'badge-status scheduled';
    }
  };

  const filteredFlights = mockFlights.filter(f => {
    const matchesFilter = filter === 'ALL' || f.status === filter;
    const matchesSearch = f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Flight Board</h1>
          <p className="page-subtitle">Arrivals and Departures</p>
        </div>
        <div className="footer-status" style={{ background: 'var(--accent-light)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}>
          <span className="status-indicator" style={{ background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}></span>
          <span>Live Radar Feed Active</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon indigo">✈️</div>
          <div className="metric-details">
            <span className="metric-value">48</span>
            <span className="metric-label">Scheduled Today</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon emerald">⏱️</div>
          <div className="metric-details">
            <span className="metric-value">94.2%</span>
            <span className="metric-label">On-Time Performance</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon cyan">🛫</div>
          <div className="metric-details">
            <span className="metric-value">12</span>
            <span className="metric-label">Active Gates</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon amber">⚠️</div>
          <div className="metric-details">
            <span className="metric-value">1</span>
            <span className="metric-label">Weather Delay</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="input-control"
            placeholder="Search flight #, airline, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
        </div>
        <div className="toolbar-right">
          <button className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All Flights</button>
          <button className={`filter-pill ${filter === 'ON TIME' ? 'active' : ''}`} onClick={() => setFilter('ON TIME')}>On Time</button>
          <button className={`filter-pill ${filter === 'BOARDING' ? 'active' : ''}`} onClick={() => setFilter('BOARDING')}>Boarding</button>
          <button className={`filter-pill ${filter === 'DELAYED' ? 'active' : ''}`} onClick={() => setFilter('DELAYED')}>Delayed</button>
        </div>
      </div>

      {/* Flight Board Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flight #</th>
              <th>Airline</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Scheduled</th>
              <th>Gate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlights.map((flight) => (
              <tr key={flight.id}>
                <td style={{ fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>
                  {flight.flightNumber}
                </td>
                <td>{flight.airline}</td>
                <td>{flight.origin}</td>
                <td>{flight.destination}</td>
                <td>{flight.scheduled}</td>
                <td>
                  <span className="user-badge" style={{ fontSize: '0.8rem' }}>{flight.gate}</span>
                </td>
                <td>
                  <span className={getStatusBadgeClass(flight.status)}>
                    <span className="badge-dot"></span>
                    {flight.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm">Track</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

