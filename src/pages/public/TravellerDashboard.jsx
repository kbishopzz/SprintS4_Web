import { useNavigate } from 'react-router-dom';

export default function TravellerDashboard() {
  const navigate = useNavigate();

  const userBookings = [
    { pnr: 'AP-98214', flight: 'AC102', airline: 'Air Canada', route: 'YYT ➔ YYZ', date: 'Aug 20, 2026', time: '08:30 AM', seat: '14A', status: 'ON TIME', gate: 'A2' },
    { pnr: 'AP-44109', flight: 'WS504', airline: 'WestJet', route: 'YYT ➔ YHZ', date: 'Sep 12, 2026', time: '01:15 PM', seat: '08C', status: 'SCHEDULED', gate: 'B1' },
  ];

  const statusColors = {
    'ON TIME': 'var(--sky-green)',
    'SCHEDULED': 'var(--sky-blue)',
    'DELAYED': 'var(--sky-yellow)',
    'CANCELLED': 'var(--sky-red)',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>My Bookings & Dashboard</h1>
          <p className="page-subtitle">Your travel profile, active bookings, and trip history.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        borderTop: '4px solid transparent',
        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, var(--sky-blue), var(--sky-green))',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        borderTopWidth: '4px', borderTopStyle: 'solid'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', fontSize: '1.75rem',
            background: 'linear-gradient(135deg, var(--sky-blue), var(--sky-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-blue)'
          }}>👤</div>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-h)' }}>Welcome back, Jane Doe</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Frequent Flyer Tier: <span style={{ color: 'var(--sky-blue)', fontWeight: '700' }}>Silver Medallion</span> &bull; Member ID: AP-884920
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/booking')}>+ Book New Flight</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/check-in')}>Web Check-In</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="metric-card blue">
          <div className="metric-icon blue">✈️</div>
          <div className="metric-details">
            <span className="metric-value">2</span>
            <span className="metric-label">Active Bookings</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">🌍</div>
          <div className="metric-details">
            <span className="metric-value">14</span>
            <span className="metric-label">Trips This Year</span>
          </div>
        </div>
        <div className="metric-card purple">
          <div className="metric-icon purple">⭐</div>
          <div className="metric-details">
            <span className="metric-value">12,400</span>
            <span className="metric-label">Reward Miles</span>
          </div>
        </div>
      </div>

      {/* Active Bookings */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>✈️ Active & Upcoming Bookings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userBookings.map((b) => (
            <div key={b.pnr} className="glass-card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '1.25rem',
              borderLeft: `4px solid ${statusColors[b.status] || 'var(--sky-blue)'}`
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: '700',
                    background: 'var(--bg)', padding: '0.25rem 0.7rem',
                    borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                    fontSize: '0.8rem', color: 'var(--text-h)'
                  }}>PNR: {b.pnr}</span>
                  <span className={`badge-status ${b.status === 'ON TIME' ? 'on-time' : 'scheduled'}`}>
                    <span className="badge-dot"></span>{b.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-h)' }}>{b.airline} &bull; Flight {b.flight}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Route: <strong>{b.route}</strong> | Date: <strong>{b.date} at {b.time}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Seat</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-h)' }}>{b.seat}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gate</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--sky-blue)' }}>{b.gate}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/check-in')}>Boarding Pass</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/baggage')}>Track Baggage</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
