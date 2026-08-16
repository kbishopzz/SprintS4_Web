import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/ApiClient';
import { useAuth } from '../../context/AuthContext';

export default function TravellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading]           = useState(true);

  const username = user?.username || 'Traveller';
  const normUser = username.toLowerCase();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getAll();
      const allBookings = res.data && Array.isArray(res.data) ? res.data : [];

      // Check local storage for user-created bookings
      let localUserBookings = [];
      try {
        const stored = localStorage.getItem(`user_bookings_${normUser}`);
        if (stored) {
          localUserBookings = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not parse local user bookings:', e);
      }

      // Filter bookings belonging to this specific logged-in user
      const filtered = allBookings.filter((b) => {
        const passFirst = b.passenger?.firstName?.toLowerCase() || '';
        const passLast  = b.passenger?.lastName?.toLowerCase() || '';
        const passEmail = b.passenger?.email?.toLowerCase() || '';

        if (normUser === 'alice' || normUser === 'alice nguyen') {
          return passFirst.includes('alice') || passEmail.includes('alice');
        }
        if (normUser === 'brandon' || normUser === 'brandon lee') {
          return passFirst.includes('brandon') || passEmail.includes('brandon');
        }
        if (normUser === 'carla' || normUser === 'carla patel') {
          return passFirst.includes('carla') || passEmail.includes('carla');
        }
        if (normUser === 'david' || normUser === 'david smith') {
          return passFirst.includes('david') || passEmail.includes('david');
        }
        if (normUser === 'keith' || normUser === 'keith bishop') {
          return passFirst.includes('keith') || passEmail.includes('keith');
        }

        // For newly registered users (e.g. kpye), check if booking belongs to them or email matches
        return passFirst.includes(normUser) || passEmail.includes(normUser) || passLast.includes(normUser);
      });

      // Merge backend filtered bookings with local session bookings
      const merged = [...localUserBookings, ...filtered];
      // Deduplicate by id or bookingReference
      const uniqueBookings = Array.from(new Map(merged.map(b => [b.id || b.bookingReference, b])).values());

      setUserBookings(uniqueBookings);
    } catch (err) {
      console.error('[TravellerDashboard] Fetch error:', err);
      // Fallback to local user bookings if backend fails
      try {
        const stored = localStorage.getItem(`user_bookings_${normUser}`);
        if (stored) setUserBookings(JSON.parse(stored));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  }, [normUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusBadgeClass = (status) => {
    const s = (status || 'ON TIME').toUpperCase();
    if (s.includes('TIME')) return 'badge-status on-time';
    if (s.includes('CHECK')) return 'badge-status on-time';
    if (s.includes('BOARD')) return 'badge-status boarding';
    if (s.includes('DELAY')) return 'badge-status delayed';
    if (s.includes('CANCEL')) return 'badge-status cancelled';
    return 'badge-status scheduled';
  };

  const getTier = () => {
    if (normUser.includes('alice')) return 'Silver Medallion';
    if (normUser.includes('brandon')) return 'Gold Medallion';
    if (normUser.includes('keith') || normUser.includes('mreid')) return 'Executive Platinum';
    return 'Preferred Member';
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
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-h)' }}>Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : username}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Frequent Flyer Tier: <span style={{ color: 'var(--sky-blue)', fontWeight: '700' }}>{getTier()}</span> &bull; Account: {normUser}
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
            <span className="metric-value">{userBookings.length}</span>
            <span className="metric-label">Active Bookings</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">🌍</div>
          <div className="metric-details">
            <span className="metric-value">{userBookings.length > 0 ? userBookings.length + 2 : 0}</span>
            <span className="metric-label">Trips This Year</span>
          </div>
        </div>
        <div className="metric-card purple">
          <div className="metric-icon purple">⭐</div>
          <div className="metric-details">
            <span className="metric-value">{userBookings.length > 0 ? (userBookings.length * 2500).toLocaleString() : '500'}</span>
            <span className="metric-label">Reward Miles</span>
          </div>
        </div>
      </div>

      {/* Active Bookings */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>✈️ Active & Upcoming Bookings</h3>
        
        {loading ? (
          <div className="loading-center"><div className="spinner"></div> Fetching your trips...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {userBookings.map((b) => {
              const pnr = b.bookingReference || `BK-${b.id}`;
              const origin = b.originAirport?.airportCode || 'YYT';
              const dest   = b.destinationAirport?.airportCode || 'YYZ';
              const gate   = b.gate?.gateNumber || b.gate?.gateCode || 'Assigned';
              const airline = b.airline?.name || 'Air Canada';
              const status = b.status || 'ON TIME';

              return (
                <div key={b.id || pnr} className="glass-card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '1.25rem',
                  borderLeft: `4px solid var(--sky-blue)`
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: '700',
                        background: 'var(--bg)', padding: '0.25rem 0.7rem',
                        borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                        fontSize: '0.8rem', color: 'var(--text-h)'
                      }}>PNR: {pnr}</span>
                      <span className={getStatusBadgeClass(status)}>
                        <span className="badge-dot"></span>{status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-h)' }}>{airline} &bull; Flight {b.flightNumber}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                      Route: <strong>{origin} ➔ {dest}</strong> | Time: <strong>{b.departureTime || '08:30 AM'}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Seat</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-h)' }}>{b.seatNumber || '14A'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gate</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: 'var(--sky-blue)' }}>Gate {gate}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(() => {
                        const sUpper = status.toUpperCase();
                        if (sUpper.includes('COMPLETE') || sUpper.includes('LANDED') || sUpper.includes('ARRIV')) {
                          return (
                            <button className="btn btn-secondary btn-sm" style={{ opacity: 0.75, cursor: 'default' }} disabled>
                              ✓ Flight Completed
                            </button>
                          );
                        }
                        if (sUpper.includes('CANCEL')) {
                          return (
                            <button className="btn btn-danger btn-sm" style={{ opacity: 0.75, cursor: 'default' }} disabled>
                              ❌ Flight Cancelled
                            </button>
                          );
                        }
                        if (sUpper.includes('CHECK') || sUpper.includes('BOARD')) {
                          return (
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/check-in', { state: { booking: b, viewBoardingPass: true } })}>
                              View Boarding Pass
                            </button>
                          );
                        }
                        return (
                          <button className="btn btn-success btn-sm" onClick={() => navigate('/check-in', { state: { booking: b, viewBoardingPass: false } })}>
                            Web Check-In ➔
                          </button>
                        );
                      })()}
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/baggage')}>Track Baggage</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {userBookings.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">✈️</div>
                <div className="empty-state-title">No upcoming trips booked</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  You currently have no active flight reservations on file for <strong>{username}</strong>.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/booking')} style={{ marginTop: '1rem' }}>
                  + Book Your Next Flight
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
