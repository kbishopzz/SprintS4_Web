import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { airportApi, bookingApi, airlineApi } from '../../api/ApiClient';

export default function BookingPage() {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [flights, setFlights]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const [fromAirportId, setFromAirportId] = useState('');
  const [toAirportId, setToAirportId]     = useState('');
  const [departDate, setDepartDate]       = useState('2026-08-20');
  const [passengerCount, setPassengerCount] = useState('1');

  const fetchReferenceData = useCallback(async () => {
    setLoading(true);
    try {
      const [apRes, bRes] = await Promise.allSettled([
        airportApi.getAll(),
        bookingApi.getAll(),
      ]);

      if (apRes.status === 'fulfilled' && Array.isArray(apRes.value.data)) {
        setAirports(apRes.value.data);
        if (apRes.value.data.length >= 2) {
          setFromAirportId(String(apRes.value.data[0].id));
          setToAirportId(String(apRes.value.data[1].id));
        } else if (apRes.value.data.length === 1) {
          setFromAirportId(String(apRes.value.data[0].id));
        }
      }

      if (bRes.status === 'fulfilled' && Array.isArray(bRes.value.data)) {
        setFlights(bRes.value.data);
      }
    } catch (err) {
      console.error('[BookingPage] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Filter flights by selected origin / destination airports
  const availableFlights = flights.filter(f => {
    const originMatch = !fromAirportId || String(f.originAirport?.id) === String(fromAirportId);
    const destMatch   = !toAirportId || String(f.destinationAirport?.id) === String(toAirportId);
    return originMatch && destMatch;
  });

  // Calculate dynamic price based on flight ID / flight number
  const getFlightPrice = (flight) => {
    const num = flight.id ? (flight.id * 45 + 180) : 299;
    return (num % 200) + 199;
  };

  const getPriceColor = (price) => {
    if (price < 280) return 'var(--sky-green)';
    if (price < 340) return 'var(--sky-blue)';
    return 'var(--sky-purple)';
  };

  const handleSelectFlight = (flight) => {
    navigate('/checkout', {
      state: {
        flight,
        passengerCount: Number(passengerCount),
        departDate,
        price: getFlightPrice(flight),
      }
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Book a Flight</h1>
          <p className="page-subtitle">Search available routes, compare live prices, and book your next trip.</p>
        </div>
      </div>

      {/* Flight Search Card */}
      <div className="glass-card" style={{ borderTop: '4px solid var(--sky-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="metric-icon blue" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>🔍</div>
          <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Search Available Routes</h3>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="form-grid">
          <div className="form-group">
            <label className="form-label">Departure Airport</label>
            <select
              className="input-control"
              value={fromAirportId}
              onChange={(e) => setFromAirportId(e.target.value)}
            >
              <option value="">-- All Departure Airports --</option>
              {airports.map((ap) => (
                <option key={ap.id} value={ap.id}>{ap.name} ({ap.airportCode})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Destination Airport</label>
            <select
              className="input-control"
              value={toAirportId}
              onChange={(e) => setToAirportId(e.target.value)}
            >
              <option value="">-- All Destination Airports --</option>
              {airports.map((ap) => (
                <option key={ap.id} value={ap.id}>{ap.name} ({ap.airportCode})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Departure Date</label>
            <input
              type="date"
              className="input-control"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Passengers</label>
            <select
              className="input-control"
              value={passengerCount}
              onChange={(e) => setPassengerCount(e.target.value)}
            >
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4+ Passengers</option>
            </select>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>
          ✈️ Available Flights ({availableFlights.length} found)
        </h3>

        {loading ? (
          <div className="loading-center"><div className="spinner"></div> Searching live routes...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {availableFlights.map((flight) => {
              const price = getFlightPrice(flight);
              const airlineName = flight.airline?.name || 'Air Canada';
              const origin = flight.originAirport?.airportCode || flight.originAirport?.name || 'YYT';
              const dest   = flight.destinationAirport?.airportCode || flight.destinationAirport?.name || 'YYZ';

              return (
                <div key={flight.id} className="glass-card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '1rem',
                  borderLeft: `4px solid ${getPriceColor(price)}`,
                  transition: 'all 0.3s var(--ease)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--sky-blue-light), var(--sky-purple-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                    }}>✈️</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-h)' }}>
                        {airlineName} ({flight.flightNumber})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Route: {origin} ➔ {dest} • Gate: {flight.gate?.gateNumber || flight.gate?.gateCode || 'Assigned'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-h)' }}>
                      {flight.departureTime || '08:30 AM'} ➔ {flight.arrivalTime || '11:45 AM'}
                    </div>
                    <span className="badge-status available" style={{ marginTop: '0.3rem', display: 'inline-flex' }}>
                      Status: {flight.status || 'ON TIME'}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: getPriceColor(price), fontFamily: 'var(--font-heading)' }}>
                      ${price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>CAD</span>
                    </div>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleSelectFlight(flight)}
                    >
                      Select & Book ➔
                    </button>
                  </div>
                </div>
              );
            })}

            {availableFlights.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">✈️</div>
                <div className="empty-state-title">No direct flights match the selected airports</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try clearing the airport filters above to view all operating routes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
