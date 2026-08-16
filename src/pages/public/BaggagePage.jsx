import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../../api/ApiClient';
import { useAuth } from '../../context/AuthContext';

export default function BaggagePage() {
  const { user } = useAuth();
  const normUser = (user?.username || '').toLowerCase();

  const [bagTag, setBagTag] = useState('');
  const [trackedBooking, setTrackedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performTrack = useCallback(async (queryTag) => {
    const searchTarget = (queryTag || bagTag).trim();
    if (!searchTarget) return;

    setLoading(true);
    setError('');

    try {
      const res = await bookingApi.getByReference(searchTarget);
      if (res.data) {
        setTrackedBooking(res.data);
        setBagTag(searchTarget);
        return;
      }
    } catch {
      try {
        const allRes = await bookingApi.getAll();
        const all = Array.isArray(allRes.data) ? allRes.data : [];

        // Check local session storage as well
        let local = [];
        try {
          const stored = localStorage.getItem(`user_bookings_${normUser}`);
          if (stored) local = JSON.parse(stored);
        } catch (e) {}

        const combined = [...local, ...all];
        const matched = combined.find(b =>
          (b.bookingReference && b.bookingReference.toLowerCase() === searchTarget.toLowerCase()) ||
          (b.flightNumber && b.flightNumber.toLowerCase() === searchTarget.toLowerCase())
        );

        if (matched) {
          setTrackedBooking(matched);
          setBagTag(searchTarget);
        } else {
          setError(`No active baggage record found for "${searchTarget}".`);
        }
      } catch (err) {
        console.error('[BaggagePage] Tracking error:', err);
        setError('Failed to connect to backend server for baggage tracking.');
      }
    } finally {
      setLoading(false);
    }
  }, [bagTag, normUser]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    performTrack(bagTag);
  };

  // Auto-fill and track user's active booking on mount
  useEffect(() => {
    async function initUserBaggage() {
      try {
        let local = [];
        try {
          const stored = localStorage.getItem(`user_bookings_${normUser}`);
          if (stored) local = JSON.parse(stored);
        } catch (e) {}

        const res = await bookingApi.getAll();
        const all = Array.isArray(res.data) ? res.data : [];

        const userBookings = [...local, ...all].filter(b => {
          const first = b.passenger?.firstName?.toLowerCase() || '';
          const last  = b.passenger?.lastName?.toLowerCase() || '';
          const email = b.passenger?.email?.toLowerCase() || '';
          return first.includes(normUser) || last.includes(normUser) || email.includes(normUser);
        });

        if (userBookings.length > 0) {
          const activeRef = userBookings[0].bookingReference || userBookings[0].flightNumber;
          if (activeRef) {
            setBagTag(activeRef);
            setTrackedBooking(userBookings[0]);
          }
        }
      } catch (err) {
        console.warn('[BaggagePage] Auto-init error:', err);
      }
    }

    if (normUser) {
      initUserBaggage();
    }
  }, [normUser]);

  const trackingSteps = [
    { icon: '✅', label: 'Checked-In', detail: 'Counter Verified', completed: true },
    { icon: '🔍', label: 'Security Cleared', detail: 'TSA Baggage Scanner', completed: true },
    { icon: '🚜', label: 'Loaded on Aircraft', detail: 'Cargo Hold B', completed: true },
    { icon: '✈️', label: 'In Transit', detail: 'En Route to Hub', completed: false, active: true },
    { icon: '🏬', label: 'Baggage Carousel', detail: 'Carousel 4', completed: false },
  ];

  const passengerDisplayName = trackedBooking?.passenger
    ? `${trackedBooking.passenger.firstName} ${trackedBooking.passenger.lastName}`
    : (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.username || 'Verified Passenger'));

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Baggage Management</h1>
          <p className="page-subtitle">Track your luggage in real-time and manage baggage for your flight.</p>
        </div>
      </div>

      {/* Baggage Lookup Form */}
      <div className="glass-card" style={{ borderTop: '4px solid var(--sky-yellow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="metric-icon yellow" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>🧳</div>
          <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Track Your Luggage</h3>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleFormSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Baggage Tag ID or Booking Ref (PNR)</label>
            <input
              type="text"
              className="input-control"
              value={bagTag}
              onChange={(e) => setBagTag(e.target.value)}
              placeholder="e.g. OBI-102024534462300202 or AC107"
              required
            />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }} disabled={loading}>
              {loading ? 'Searching...' : '🔍 Track Baggage'}
            </button>
          </div>
        </form>
      </div>

      {/* Tracking Card */}
      {trackedBooking ? (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ color: 'var(--text-h)', margin: 0 }}>
                Tag: {trackedBooking?.bookingReference ? `BG-${trackedBooking.bookingReference}` : bagTag} • Checked Baggage ({trackedBooking?.baggageCount ?? 1} Bag{trackedBooking?.baggageCount !== 1 ? 's' : ''})
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Assigned to Flight {trackedBooking?.flightNumber || 'Active Flight'} ({trackedBooking?.originAirport?.airportCode || 'Origin'} ➔ {trackedBooking?.destinationAirport?.airportCode || 'Destination'})
              </span>
            </div>
            <span className="badge-status in-transit"><span className="badge-dot"></span>In Flight</span>
          </div>

          {/* Animated Tracking Timeline */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', position: 'relative' }}>
            {trackingSteps.map((s, idx) => (
              <div key={idx} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                textAlign: 'center',
              }}>
                {/* Connector line */}
                {idx > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '50%',
                    width: '100%',
                    height: '3px',
                    background: s.completed || s.active
                      ? 'linear-gradient(90deg, var(--sky-green), var(--sky-blue))'
                      : 'var(--border)',
                    zIndex: 0,
                    borderRadius: '3px'
                  }}></div>
                )}

                {/* Circle node */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  zIndex: 1,
                  background: s.completed
                    ? 'var(--sky-green-light)'
                    : s.active
                      ? 'var(--sky-blue-light)'
                      : 'var(--bg)',
                  border: s.completed
                    ? '3px solid var(--sky-green)'
                    : s.active
                      ? '3px solid var(--sky-blue)'
                      : '3px solid var(--border)',
                  boxShadow: s.active
                    ? 'var(--shadow-blue)'
                    : s.completed
                      ? 'var(--shadow-green)'
                      : 'none',
                  transition: 'all 0.3s var(--ease)',
                  animation: s.active ? 'boardingPulse 2s infinite' : 'none',
                }}>{s.icon}</div>

                {/* Label */}
                <div style={{
                  marginTop: '0.6rem',
                  fontSize: '0.82rem',
                  fontWeight: s.completed || s.active ? 700 : 500,
                  color: s.completed
                    ? 'var(--sky-green)'
                    : s.active
                      ? 'var(--sky-blue)'
                      : 'var(--text-muted)',
                }}>{s.label}</div>

                {/* Detail */}
                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.15rem'
                }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧳</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Real-Time Baggage Tracker</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Enter your booking reference or baggage tag ID above to view live tracking information.
          </p>
        </div>
      )}

      {/* Baggage Info Cards */}
      <div className="card-grid-3">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-blue)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📏</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Size & Weight</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Standard Size • <strong>18.5 kg</strong> / 23 kg max
          </p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-green)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Passenger Tag</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            {passengerDisplayName} — <strong style={{ color: 'var(--sky-green)' }}>Verified</strong>
          </p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-yellow)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Estimated Arrival</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Destination Hub • <strong>{trackedBooking?.arrivalTime || '05:15 PM'}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
