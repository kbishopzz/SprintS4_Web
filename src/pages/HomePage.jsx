import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, airportApi } from '../api/ApiClient';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeAirport, setActiveAirport] = useState('ALL');
  const [filter, setFilter]                 = useState('ALL');
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);

  const [flights, setFlights]               = useState([]);
  const [airports, setAirports]             = useState([]);
  const [loading, setLoading]               = useState(true);

  const handleUserOption = (targetPath) => {
    if (isAuthenticated) {
      navigate(targetPath);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(targetPath)}`);
    }
  };

  // ── Fetch Live Data ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, airportsRes] = await Promise.allSettled([
        bookingApi.getAll(),
        airportApi.getAll(),
      ]);

      if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data)) {
        setFlights(bookingsRes.value.data);
      } else {
        setFlights([]);
      }

      if (airportsRes.status === 'fulfilled' && Array.isArray(airportsRes.value.data)) {
        setAirports(airportsRes.value.data);
      } else {
        setAirports([]);
      }
    } catch (err) {
      console.error('[HomePage] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadgeClass = (status) => {
    const s = (status || 'ON TIME').toUpperCase();
    if (s.includes('TIME')) return 'badge-status on-time';
    if (s.includes('BOARD')) return 'badge-status boarding';
    if (s.includes('DELAY')) return 'badge-status delayed';
    if (s.includes('LAND')) return 'badge-status landed';
    if (s.includes('CANCEL')) return 'badge-status cancelled';
    return 'badge-status scheduled';
  };

  const filteredFlights = flights.filter(f => {
    const flightNo = f.flightNumber || '';
    const airlineName = f.airline?.name || '';
    const origin = f.originAirport?.name || f.originAirport?.airportCode || '';
    const dest = f.destinationAirport?.name || f.destinationAirport?.airportCode || '';
    const originCode = f.originAirport?.airportCode || '';
    const destCode = f.destinationAirport?.airportCode || '';

    const matchesHub = activeAirport === 'ALL' || originCode === activeAirport || destCode === activeAirport;

    const statusStr = (f.status || 'ON TIME').toUpperCase();
    const matchesFilter = filter === 'ALL' || statusStr.includes(filter);

    const matchesSearch = !searchTerm ||
      flightNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airlineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesHub && matchesFilter && matchesSearch;
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
        }}>Live Flight Board</h1>
        <p style={{ maxWidth: '640px', margin: '0 auto 2rem', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Real-time flight status, instant mobile check-ins, automated gate changes, and live luggage tracking across North American hubs.
        </p>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', maxWidth: '960px', margin: '0 auto' }}>
          <div className="glass-card" onClick={() => handleUserOption('/booking')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-blue)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>✈️</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>Book a Flight</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Search routes, rates & seats</p>
          </div>

          <div className="glass-card" onClick={() => handleUserOption('/check-in')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-green)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🎫</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>Web Check-In</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Get instant digital boarding pass</p>
          </div>

          <div className="glass-card" onClick={() => handleUserOption('/baggage')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-yellow)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🧳</div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>Baggage Tracker</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Live luggage status feed</p>
          </div>

          <div className="glass-card" onClick={() => handleUserOption('/my-bookings')} style={{ padding: '1.25rem', textAlign: 'left', cursor: 'pointer', borderLeft: '4px solid var(--sky-purple)' }}>
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
              style={{ width: '260px', fontWeight: '700', color: 'var(--sky-blue)' }}
            >
              <option value="ALL">All Airport Hubs</option>
              {airports.map(ap => (
                <option key={ap.id} value={ap.airportCode}>{ap.name} ({ap.airportCode})</option>
              ))}
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
            <button className={`filter-pill ${filter === 'DELAY' ? 'active' : ''}`} onClick={() => setFilter('DELAY')}>Delayed</button>
          </div>
        </div>

        {/* Flight Board Table */}
        <div className="table-container" style={{ marginTop: '1.25rem' }}>
          {loading ? (
            <div className="loading-center"><div className="spinner"></div> Fetching Live Flights...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Flight #</th>
                  <th>Airline Operator</th>
                  <th>Origin Hub</th>
                  <th>Destination</th>
                  <th>Scheduled Time</th>
                  <th>Gate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((flight) => {
                  const origin = flight.originAirport?.airportCode || flight.originAirport?.name || 'YYT';
                  const dest   = flight.destinationAirport?.airportCode || flight.destinationAirport?.name || 'YYZ';
                  const gate   = flight.gate?.gateNumber || flight.gate?.gateCode || 'Unassigned';
                  const airlineName = flight.airline?.name || 'Partner';
                  const status = flight.status || 'ON TIME';

                  return (
                    <tr key={flight.id}>
                      <td style={{ fontWeight: '800', color: 'var(--text-h)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                        ✈️ {flight.flightNumber}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>{airlineName}</td>
                      <td>{origin}</td>
                      <td><strong style={{ color: 'var(--sky-blue)' }}>{dest}</strong></td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{flight.departureTime || '08:30 AM'}</td>
                      <td>
                        <span style={{
                          fontWeight: 800, background: 'var(--sky-blue-light)',
                          color: 'var(--sky-blue)', padding: '0.25rem 0.7rem',
                          borderRadius: 'var(--radius-full)', fontSize: '0.8rem'
                        }}>
                          Gate {gate}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(status)}>
                          <span className="badge-dot"></span>
                          {status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedFlight(flight)}>
                          Radar Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filteredFlights.length === 0 && (
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
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-h)' }}>{selectedFlight.airline?.name || 'Partner'}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aircraft Type</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--sky-blue)' }}>{selectedFlight.plane?.type || 'Boeing 737'}</strong>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
                textAlign: 'center', padding: '1.25rem',
                background: 'linear-gradient(135deg, var(--sky-blue-light), var(--sky-purple-light))',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-h)' }}>
                    {selectedFlight.originAirport?.airportCode || 'YYT'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedFlight.originAirport?.name || 'Departure'}</div>
                </div>
                <div style={{ fontSize: '1.5rem', color: 'var(--sky-blue)' }}>✈️ ➔</div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sky-blue)' }}>
                    {selectedFlight.destinationAirport?.airportCode || 'YYZ'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedFlight.destinationAirport?.name || 'Arrival'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Gate</span>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--sky-blue)' }}>
                    Gate {selectedFlight.gate?.gateNumber || selectedFlight.gate?.gateCode || 'A1'}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled Time</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-h)' }}>{selectedFlight.departureTime || '08:30 AM'}</div>
                </div>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span className={getStatusBadgeClass(selectedFlight.status)}>{selectedFlight.status || 'ON TIME'}</span>
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
