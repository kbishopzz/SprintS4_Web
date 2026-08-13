import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();
  const [fromCity, setFromCity] = useState('St. Johns (YYT)');
  const [toCity, setToCity] = useState('Toronto (YYZ)');
  const [departDate, setDepartDate] = useState('2026-08-20');
  const [passengers, setPassengers] = useState('1');

  const availableFlights = [
    { id: 'AC102', airline: 'Air Canada', depart: '08:30', arrive: '10:45', duration: '3h 15m', stops: 'Non-stop', price: 349, seats: 8 },
    { id: 'WS504', airline: 'WestJet', depart: '13:15', arrive: '15:40', duration: '3h 25m', stops: 'Non-stop', price: 299, seats: 4 },
    { id: 'PD301', airline: 'Porter Airlines', depart: '17:00', arrive: '20:10', duration: '4h 10m', stops: '1 Stop (YHZ)', price: 259, seats: 12 },
  ];

  const getPriceColor = (price) => {
    if (price < 280) return 'var(--sky-green)';
    if (price < 330) return 'var(--sky-blue)';
    return 'var(--sky-purple)';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Book a Flight</h1>
          <p className="page-subtitle">Search available routes, compare prices, and book your next adventure.</p>
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
            <input
              type="text"
              className="input-control"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              placeholder="e.g. St. Johns (YYT)"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Destination Airport</label>
            <input
              type="text"
              className="input-control"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              placeholder="e.g. Toronto (YYZ)"
            />
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
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
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
          ✈️ Available Flights: {fromCity} ➔ {toCity}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {availableFlights.map((flight) => (
            <div key={flight.id} className="glass-card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '1rem',
              borderLeft: `4px solid ${getPriceColor(flight.price)}`,
              transition: 'all 0.3s var(--ease)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--sky-blue-light), var(--sky-purple-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>✈️</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-h)' }}>{flight.airline} ({flight.id})</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration: {flight.duration} • {flight.stops}</div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-h)' }}>
                  {flight.depart} ➔ {flight.arrive}
                </div>
                <span className="badge-status available" style={{ marginTop: '0.3rem', display: 'inline-flex' }}>
                  {flight.seats} seats remaining
                </span>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: getPriceColor(flight.price), fontFamily: 'var(--font-heading)' }}>
                  ${flight.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>CAD</span>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => navigate('/checkout')}
                >
                  Select & Book ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
