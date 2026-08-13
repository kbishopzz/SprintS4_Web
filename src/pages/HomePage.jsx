import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeAirport, setActiveAirport] = useState('YYT');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);

  const mockFlights = [
    { id: 1, flightNumber: 'AC102', airline: 'Air Canada', origin: 'YYT (St. Johns)', destination: 'YYZ (Toronto)', scheduled: '08:30 AM', gate: 'A2', status: 'ON TIME', aircraft: 'Boeing 737 MAX 8' },
    { id: 2, flightNumber: 'WS504', airline: 'WestJet', origin: 'YYT (St. Johns)', destination: 'YHZ (Halifax)', scheduled: '09:15 AM', gate: 'B1', status: 'BOARDING', aircraft: 'Airbus A320neo' },
    { id: 3, flightNumber: 'PD301', airline: 'Porter Airlines', origin: 'YUL (Montreal)', destination: 'YYT (St. Johns)', scheduled: '10:00 AM', gate: 'A4', status: 'DELAYED', aircraft: 'De Havilland Dash 8' },
    { id: 4, flightNumber: 'AC880', airline: 'Air Canada', origin: 'YYT (St. Johns)', destination: 'LHR (London)', scheduled: '11:45 AM', gate: 'C3', status: 'SCHEDULED', aircraft: 'Boeing 787-9' },
    { id: 5, flightNumber: 'PAL10', airline: 'PAL Airlines', origin: 'YDF (Deer Lake)', destination: 'YYT (St. Johns)', scheduled: '12:30 PM', gate: 'B3', status: 'LANDED', aircraft: 'Dash 8-Q400' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ON TIME': return 'badge-status on-time';
      case 'BOARDING': return 'badge-status boarding';
      case 'DELAYED': return 'badge-status delayed';
      case 'LANDED': return 'badge-status landed';
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
    <div className="page-container" style={{ gap: '2.5rem' }}>
      {/* Hero Section */}
      <section className="hero-banner" style={{
        padding: '3.5rem 2rem',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 40%, #FDF2F8 70%, #FEF2F2 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '3rem', opacity: 0.08, pointerEvents: 'none', animation: 'float 4s ease-in-out infinite' }}>✈️</div>
        <div style={{ position: 'absolute', bottom: '15%', right: '12%', fontSize: '2.5rem', opacity: 0.06, pointerEvents: 'none', animation: 'float 5s ease-in-out infinite 1s' }}>🌍</div>

        <span className="badge-status scheduled" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', marginBottom: '1rem', display: 'inline-flex' }}>
          ✨ Next-Gen Airport & Flight Self-Service Portal
        </span>
        <h1 style={{
          fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, var(--sky-blue), var(--sky-purple), var(--sky-pink))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>Flight Board</h1>
        <p style={{ maxWidth: '640px', margin: '0 auto 2rem', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Real-time flight board, instant mobile check-ins, automated gate changes, and live luggage tracking across North American hubs.
        </p>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', maxWidth: '960px', margin: '0 auto' }}>
          <div className="glass-card" onClick={() => navigate('/booking')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-blue)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>✈️</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>Book a Flight</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Search routes, rates & seats</p>
          </div>

          <div className="glass-card" onClick={() => navigate('/check-in')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-green)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🎫</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>Web Check-In</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Get instant digital boarding pass</p>
          </div>

          <div className="glass-card" onClick={() => navigate('/baggage')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-yellow)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🧳</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>Baggage Tracker</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Live luggage status feed</p>
          </div>

          <div className="glass-card" onClick={() => navigate('/my-bookings')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-purple)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>👤</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>My Trips</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Manage itineraries & seats</p>
          </div>
        </div>
      </section>

      {/* Main Flight Board Header */}
      <div>
        <div className="page-header" style={{ border: 'none', paddingBottom: 0 }}>
          <div className="page-header-text">
            <h2>Live Airport Flight Board</h2>
            <p className="page-subtitle">Real-time arrival and departure monitor for selected airport hub.</p>
          </div>

          {/* Airport Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Hub:</span>
            <select
              className="input-control"
              value={activeAirport}
              onChange={(e) => setActiveAirport(e.target.value)}
              style={{ width: '240px', fontWeight: '700', color: 'var(--sky-blue)' }}
            >
              <option value="YYT">St. John's International (YYT)</option>
              <option value="YYZ">Toronto Pearson (YYZ)</option>
              <option value="YUL">Montreal-Trudeau (YUL)</option>
              <option value="YHZ">Halifax Stanfield (YHZ)</option>
            </select>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="toolbar" style={{ marginTop: '1.25rem' }}>
          <div className="toolbar-left">
            <div className="topbar-search" style={{ maxWidth: '300px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search flight #, airline, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="toolbar-right">
            <button className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All Flights</button>
            <button className={`filter-pill ${filter === 'ON TIME' ? 'active' : ''}`} onClick={() => setFilter('ON TIME')}>On Time</button>
            <button className={`filter-pill ${filter === 'BOARDING' ? 'active' : ''}`} onClick={() => setFilter('BOARDING')}>Boarding</button>
            <button className={`filter-pill ${filter === 'DELAYED' ? 'active' : ''}`} onClick={() => setFilter('DELAYED')}>Delayed</button>
            <button className={`filter-pill ${filter === 'LANDED' ? 'active' : ''}`} onClick={() => setFilter('LANDED')}>Landed</button>
          </div>
        </div>

        {/* Flight Board Table */}
        <div className="table-container" style={{ marginTop: '1.25rem' }}>
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
                  <td style={{ fontWeight: '800', color: 'var(--text-h)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                    ✈️ {flight.flightNumber}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>{flight.airline}</td>
                  <td>{flight.origin}</td>
                  <td><strong style={{ color: 'var(--sky-blue)' }}>{flight.destination}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{flight.scheduled}</td>
                  <td>
                    <span style={{
                      fontWeight: 800, background: 'var(--sky-blue-light)',
                      color: 'var(--sky-blue)', padding: '0.25rem 0.7rem',
                      borderRadius: 'var(--radius-full)', fontSize: '0.8rem'
                    }}>
                      Gate {flight.gate}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(flight.status)}>
                      <span className="badge-dot"></span>
                      {flight.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedFlight(flight)}>
                      Radar Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFlights.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✈️</div>
              <div className="empty-state-title">No flights match your criteria</div>
            </div>
          )}
        </div>
      </div>

      {/* Track Flight Modal */}
      {selectedFlight && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '580px' }}>
            <div className="modal-header blue">
              <h3>📡 Radar Tracking • {selectedFlight.flightNumber}</h3>
              <button className="btn-icon" onClick={() => setSelectedFlight(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Airline Operator</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-h)' }}>{selectedFlight.airline}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aircraft Type</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--sky-blue)' }}>{selectedFlight.aircraft}</strong>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
                textAlign: 'center', padding: '1.25rem',
                background: 'linear-gradient(135deg, var(--sky-blue-light), var(--sky-purple-light))',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-h)' }}>{selectedFlight.origin.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Departure</div>
                </div>
                <div style={{ fontSize: '1.5rem', color: 'var(--sky-blue)' }}>✈️ ➔</div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sky-blue)' }}>{selectedFlight.destination.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Arrival</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Gate</span>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--sky-blue)' }}>Gate {selectedFlight.gate}</div>
                </div>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled Time</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-h)' }}>{selectedFlight.scheduled}</div>
                </div>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span className={getStatusBadgeClass(selectedFlight.status)}>{selectedFlight.status}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedFlight(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setSelectedFlight(null); navigate('/check-in'); }}>
                Proceed to Check-In ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
