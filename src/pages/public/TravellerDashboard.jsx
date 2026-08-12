import { useNavigate } from 'react-router-dom';

export default function TravellerDashboard() {
  const navigate = useNavigate();

  const userBookings = [
    { pnr: 'AP-98214', flight: 'AC102', airline: 'Air Canada', route: 'YYT ➔ YYZ', date: 'Aug 20, 2026', time: '08:30 AM', seat: '14A', status: 'ON TIME', gate: 'A2' },
    { pnr: 'AP-44109', flight: 'WS504', airline: 'WestJet', route: 'YYT ➔ YHZ', date: 'Sep 12, 2026', time: '01:15 PM', seat: '08C', status: 'SCHEDULED', gate: 'B1' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>My Bookings & Dashboard</h1>
          <p className="page-subtitle">Traveller profile and active flight bookings template.</p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="brand-icon" style={{ width: '56px', height: '56px', fontSize: '1.75rem', borderRadius: '50%' }}>👤</div>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-h)' }}>Welcome back, Jane Doe</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Frequent Flyer Tier: <span style={{ color: '#38bdf8', fontWeight: '600' }}>Silver Medallion</span> &bull; Member ID: AP-884920
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/booking')}>+ Book New Flight</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/check-in')}>Web Check-In</button>
        </div>
      </div>

      {/* Active Bookings List */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>✈️ Active & Upcoming Bookings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userBookings.map((b) => (
            <div key={b.pnr} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span className="user-badge" style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>PNR: {b.pnr}</span>
                  <span className="badge-status on-time"><span className="badge-dot"></span>{b.status}</span>
                </div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-h)' }}>{b.airline} &bull; Flight {b.flight}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Route: <strong>{b.route}</strong> | Date: <strong>{b.date} at {b.time}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Seat</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-h)' }}>{b.seat}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gate</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#38bdf8' }}>{b.gate}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/check-in')}>Boarding Pass</button>
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

