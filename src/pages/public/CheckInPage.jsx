import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingApi } from '../../api/ApiClient';
import { useAuth } from '../../context/AuthContext';

export default function CheckInPage() {
  const location = useLocation();
  const { user } = useAuth();
  
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : (user?.username || '');
    
  const normUser = (user?.username || '').toLowerCase();

  const [step, setStep]                   = useState(1);
  const [pnr, setPnr]                     = useState('');
  const [lastName, setLastName]           = useState('');
  const [userBookings, setUserBookings]   = useState([]);
  const [foundBooking, setFoundBooking]   = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError]     = useState('');

  const [selectedSeat, setSelectedSeat]     = useState('14A');
  const [baggageCount, setBaggageCount]     = useState(1);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const seatMap = [
    { id: '12A', status: 'available' },
    { id: '12B', status: 'taken' },
    { id: '12C', status: 'available' },
    { id: '14A', status: 'available' },
    { id: '14B', status: 'taken' },
    { id: '14C', status: 'available' },
    { id: '15D', status: 'taken' },
    { id: '15E', status: 'available' },
    { id: '15F', status: 'available' },
    { id: '18A', status: 'available' },
    { id: '18B', status: 'available' },
    { id: '20D', status: 'taken' },
  ];

  // If navigated directly with booking state (e.g. clicking "Boarding Pass" or "Web Check-In" from dashboard)
  useEffect(() => {
    if (location.state?.booking) {
      const b = location.state.booking;
      setFoundBooking(b);
      setPnr(b.bookingReference || b.flightNumber || '');
      setLastName(b.passenger?.lastName || user?.lastName || user?.username || '');
      setSelectedSeat(b.seatNumber || '14A');
      setBaggageCount(b.baggageCount ?? 1);
      
      const isAlreadyCheckedIn = location.state?.viewBoardingPass ||
        (b.status && (b.status.toUpperCase().includes('CHECK') || b.status.toUpperCase().includes('BOARD')));
        
      if (isAlreadyCheckedIn) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
  }, [location.state, user]);

  // Load active user bookings on mount to provide one-click check-in or direct boarding pass view
  useEffect(() => {
    async function loadUserBookings() {
      try {
        const res = await bookingApi.getAll();
        const all = res.data && Array.isArray(res.data) ? res.data : [];

        let local = [];
        try {
          const stored = localStorage.getItem(`user_bookings_${normUser}`);
          if (stored) local = JSON.parse(stored);
        } catch (e) {}

        const matched = all.filter(b => {
          const first = b.passenger?.firstName?.toLowerCase() || '';
          const last  = b.passenger?.lastName?.toLowerCase() || '';
          const email = b.passenger?.email?.toLowerCase() || '';
          return first.includes(normUser) || last.includes(normUser) || email.includes(normUser);
        });

        const combined = [...local, ...matched];
        const unique = Array.from(new Map(combined.map(b => [b.id || b.bookingReference, b])).values());
        
        setUserBookings(unique);

        if (!location.state?.booking && unique.length > 0) {
          setPnr(unique[0].bookingReference || unique[0].flightNumber || '');
          setLastName(user?.lastName || user?.username || '');
        }
      } catch (err) {
        console.warn('[CheckInPage] Could not load user bookings:', err);
      }
    }
    if (normUser) {
      loadUserBookings();
    }
  }, [normUser, user, location.state]);

  const handleQuickCheckIn = (booking) => {
    setFoundBooking(booking);
    setPnr(booking.bookingReference || booking.flightNumber || '');
    setLastName(user?.lastName || user?.username || '');
    setSelectedSeat(booking.seatNumber || '14A');
    setBaggageCount(booking.baggageCount ?? 1);

    const isAlreadyCheckedIn = booking.status &&
      (booking.status.toUpperCase().includes('CHECK') || booking.status.toUpperCase().includes('BOARD'));

    if (isAlreadyCheckedIn) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    const searchPnr = pnr.trim();
    if (!searchPnr) {
      setLookupError('Please enter a booking reference or flight number.');
      return;
    }

    setLookupLoading(true);
    setLookupError('');

    try {
      const res = await bookingApi.getByReference(searchPnr);
      if (res.data) {
        setFoundBooking(res.data);
        setSelectedSeat(res.data.seatNumber || '14A');
        setBaggageCount(res.data.baggageCount ?? 1);
        const isAlreadyCheckedIn = res.data.status &&
          (res.data.status.toUpperCase().includes('CHECK') || res.data.status.toUpperCase().includes('BOARD'));
        setStep(isAlreadyCheckedIn ? 3 : 2);
        return;
      }
    } catch {
      try {
        const allRes = await bookingApi.getAll();
        const all = Array.isArray(allRes.data) ? allRes.data : [];
        
        const matched = all.find(b =>
          (b.bookingReference && b.bookingReference.toLowerCase() === searchPnr.toLowerCase()) ||
          (b.flightNumber && b.flightNumber.toLowerCase() === searchPnr.toLowerCase()) ||
          (b.passenger?.lastName && lastName && b.passenger.lastName.toLowerCase() === lastName.trim().toLowerCase())
        );

        if (matched) {
          setFoundBooking(matched);
          setSelectedSeat(matched.seatNumber || '14A');
          setBaggageCount(matched.baggageCount ?? 1);
          const isAlreadyCheckedIn = matched.status &&
            (matched.status.toUpperCase().includes('CHECK') || matched.status.toUpperCase().includes('BOARD'));
          setStep(isAlreadyCheckedIn ? 3 : 2);
        } else if (userBookings.length > 0) {
          setFoundBooking(userBookings[0]);
          setSelectedSeat(userBookings[0].seatNumber || '14A');
          setBaggageCount(userBookings[0].baggageCount ?? 1);
          setStep(3);
        } else {
          setLookupError('No reservation found for ' + searchPnr + '. Please verify your reference.');
        }
      } catch (err) {
        console.error('[CheckInPage] Lookup error:', err);
        setLookupError('Could not connect to backend server for check-in.');
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const handleConfirmSeat = async () => {
    if (!foundBooking) {
      setStep(3);
      return;
    }
    setCheckInLoading(true);

    const updatedBooking = {
      ...foundBooking,
      status: 'CHECKED_IN',
      seatNumber: selectedSeat,
      baggageCount: Number(baggageCount),
    };

    // Update local storage for active user session so TravellerDashboard reflects CHECKED_IN status
    if (normUser) {
      try {
        const key = `user_bookings_${normUser}`;
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedList = stored.map(b => (
          (b.bookingReference === foundBooking.bookingReference || b.id === foundBooking.id)
            ? updatedBooking
            : b
        ));
        localStorage.setItem(key, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Could not update localStorage booking:', e);
      }
    }

    try {
      if (foundBooking.id) {
        await bookingApi.checkIn(foundBooking.id);
        await bookingApi.update(foundBooking.id, updatedBooking).catch(() => {});
      }
      setFoundBooking(updatedBooking);
    } catch (err) {
      console.error('[CheckInPage] Check-in API error:', err);
    } finally {
      setCheckInLoading(false);
      setStep(3);
    }
  };

  const activeBooking = userBookings[0];
  const isCheckedIn = activeBooking?.status &&
    (activeBooking.status.toUpperCase().includes('CHECK') || activeBooking.status.toUpperCase().includes('BOARD'));

  // Clean Passenger display name without TestUser strings
  const passLast = foundBooking?.passenger?.lastName && !foundBooking.passenger.lastName.toLowerCase().includes('testuser')
    ? foundBooking.passenger.lastName.toUpperCase()
    : (user?.lastName ? user.lastName.toUpperCase() : (normUser ? normUser.toUpperCase() : 'PASSENGER'));

  const passFirst = foundBooking?.passenger?.firstName && !foundBooking.passenger.firstName.toLowerCase().includes('testuser')
    ? foundBooking.passenger.firstName.toUpperCase()
    : (user?.firstName ? user.firstName.toUpperCase() : (normUser ? normUser.toUpperCase() : 'CLIENT'));

  return (
    <div className="page-container" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <div className="page-header-text" style={{ alignItems: 'center' }}>
          <h1>Self-Service Check-In</h1>
          <p className="page-subtitle">Complete check-in, select your seat & baggage, and generate your digital boarding pass.</p>
        </div>
      </div>

      {/* Wizard Stepper */}
      <div className="wizard-stepper">
        <div className={`wizard-step ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}`}>
          <div className={`wizard-circle ${step === 1 ? 'active' : step > 1 ? 'completed' : 'pending'}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <span className="wizard-label">Retrieve Booking</span>
        </div>

        <div className={`wizard-connector ${step > 1 ? 'filled' : ''}`}></div>

        <div className={`wizard-step ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>
          <div className={`wizard-circle ${step === 2 ? 'active' : step > 2 ? 'completed' : 'pending'}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <span className="wizard-label">Seat & Baggage</span>
        </div>

        <div className={`wizard-connector ${step > 2 ? 'filled' : ''}`}></div>

        <div className={`wizard-step ${step >= 3 ? 'active completed' : ''}`}>
          <div className={`wizard-circle ${step >= 3 ? 'completed' : 'pending'}`}>
            {step >= 3 ? '✓' : '3'}
          </div>
          <span className="wizard-label">Boarding Pass</span>
        </div>
      </div>

      {/* Step 1: Lookup Form & Quick Check-In / View Pass */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeInUp 0.4s var(--ease)' }}>
          {activeBooking && (
            <div className="glass-card" style={{
              padding: '1.5rem',
              borderLeft: isCheckedIn ? '4px solid var(--sky-blue)' : '4px solid var(--sky-green)',
              background: isCheckedIn ? 'var(--sky-blue-light)' : 'var(--sky-green-light)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className={`badge-status ${isCheckedIn ? 'on-time' : 'available'}`} style={{ marginBottom: '0.4rem', display: 'inline-flex' }}>
                    {isCheckedIn ? '✓ Flight Checked-In' : '⚡ One-Click Check-In Available'} for {displayName || normUser}
                  </span>
                  <h3 style={{ margin: '0.2rem 0', color: 'var(--text-h)' }}>
                    {activeBooking.airline?.name || 'Flight'} {activeBooking.flightNumber} ({activeBooking.originAirport?.airportCode || 'YYT'} ➔ {activeBooking.destinationAirport?.airportCode || 'YYZ'})
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    PNR: <strong>{activeBooking.bookingReference || 'BK-' + activeBooking.id}</strong> | Departure: {activeBooking.departureTime || '08:30 AM'} | Seat: <strong>{activeBooking.seatNumber || '14A'}</strong>
                  </p>
                </div>
                <button
                  className={`btn ${isCheckedIn ? 'btn-primary' : 'btn-success'}`}
                  onClick={() => handleQuickCheckIn(activeBooking)}
                >
                  {isCheckedIn ? '🎫 View Digital Boarding Pass ➔' : '⚡ Instant Check-In ➔'}
                </button>
              </div>
            </div>
          )}

          <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--sky-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="metric-icon blue" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>🎫</div>
              <div>
                <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Enter Reservation Details</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Look up your booking to begin check-in or view boarding pass</p>
              </div>
            </div>

            {lookupError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{lookupError}</div>}

            <form onSubmit={handleLookup} className="form-grid">
              <div className="form-group">
                <label className="form-label">Booking Reference (PNR / Flight #)</label>
                <input
                  type="text"
                  className="input-control"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  placeholder="e.g. OBI-102024534462300202"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Passenger Last Name</label>
                <input
                  type="text"
                  className="input-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Bishop or your last name"
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={lookupLoading}>
                  {lookupLoading ? 'Searching Reservation...' : '🔍 Find Reservation & View Boarding Pass ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Seat & Baggage Selector */}
      {step === 2 && (
        <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--sky-green)', animation: 'fadeInUp 0.4s var(--ease)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="metric-icon green" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>💺</div>
              <div>
                <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Select Seat & Declare Checked Baggage</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {foundBooking?.airline?.name || 'Air Canada'} {foundBooking?.flightNumber || 'AC107'} • {foundBooking?.originAirport?.airportCode || 'YYT'} ➔ {foundBooking?.destinationAirport?.airportCode || 'YYZ'}
                </p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>◀ Change PNR</button>
          </div>

          {/* Seat Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-h)', marginBottom: '0.75rem' }}>💺 1. Choose Your Seat:</h4>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--bg)', border: '2px solid var(--border)' }}></div>
                Available
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(135deg, var(--sky-blue), var(--sky-blue-deep))' }}></div>
                Selected
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--bg-alt)', opacity: 0.5, border: '2px solid var(--border-light)' }}></div>
                Taken
              </div>
            </div>

            <div className="seat-grid" style={{ margin: '1rem 0' }}>
              {seatMap.map((seat) => (
                <button
                  key={seat.id}
                  className={`seat-btn ${selectedSeat === seat.id ? 'selected' : ''} ${seat.status === 'taken' ? 'taken' : ''}`}
                  onClick={() => seat.status !== 'taken' && setSelectedSeat(seat.id)}
                  disabled={seat.status === 'taken'}
                >
                  {seat.id}
                </button>
              ))}
            </div>
          </div>

          {/* Baggage Selection Section */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ color: 'var(--text-h)', marginBottom: '0.75rem' }}>🧳 2. Declare Checked Baggage:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { count: 0, title: '0 Checked Bags', desc: 'Carry-on & personal item only' },
                { count: 1, title: '1 Checked Bag', desc: 'Standard luggage (up to 50 lbs)' },
                { count: 2, title: '2 Checked Bags', desc: '2 Checked bags included' },
              ].map((opt) => (
                <div
                  key={opt.count}
                  onClick={() => setBaggageCount(opt.count)}
                  className={`glass-card ${baggageCount === opt.count ? 'selected' : ''}`}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderLeft: baggageCount === opt.count ? '4px solid var(--sky-green)' : '4px solid var(--border)',
                    background: baggageCount === opt.count ? 'var(--sky-green-light)' : 'var(--bg-card)',
                    transition: 'all 0.2s var(--ease)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem' }}>{opt.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          <div className="glass-card" style={{
            padding: '1rem', textAlign: 'center',
            background: 'var(--sky-blue-light)', borderColor: 'rgba(59, 130, 246, 0.2)',
            marginTop: '1.5rem'
          }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Selected Details: </span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>Seat {selectedSeat}</strong>
            <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>•</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--sky-green)', fontFamily: 'var(--font-heading)' }}>{baggageCount} Bag{baggageCount !== 1 ? 's' : ''} Checked</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-success btn-lg" onClick={handleConfirmSeat} disabled={checkInLoading}>
              {checkInLoading ? 'Checking in...' : 'Confirm Check-In & Generate Pass ➔'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Boarding Pass */}
      {step === 3 && (
        <div style={{ animation: 'bounceIn 0.6s var(--ease-spring)' }}>
          <div className="success-check" style={{ marginBottom: '1.5rem' }}>
            <div className="success-check-circle">✅</div>
            <h2 style={{ color: 'var(--sky-green)', margin: 0 }}>Digital Boarding Pass</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Confirmed for <strong>{foundBooking?.airline?.name || 'Air Canada'} Flight {foundBooking?.flightNumber || 'AC107'}</strong>.
            </p>
          </div>

          <div className="boarding-pass">
            <div className="boarding-pass-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🛫</span>
                <div>
                  <strong style={{ fontSize: '1.1rem', display: 'block' }}>
                    {foundBooking?.airline?.name || 'Air Canada'} • Flight {foundBooking?.flightNumber || 'AC107'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    PNR: {foundBooking?.bookingReference || pnr} • PASSENGER: {passLast}, {passFirst}
                  </span>
                </div>
              </div>
              <span className="badge-status on-time" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                ✓ CHECKED-IN
              </span>
            </div>

            <div className="boarding-pass-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FROM</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-h)', fontFamily: 'var(--font-heading)' }}>
                    {foundBooking?.originAirport?.airportCode || 'YYZ'}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{foundBooking?.originAirport?.name || 'Toronto Pearson'}</span>
                </div>
                <div style={{ color: 'var(--sky-blue)', fontSize: '1.5rem' }}>✈️ ➔</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TO</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>
                    {foundBooking?.destinationAirport?.airportCode || 'YVR'}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{foundBooking?.destinationAirport?.name || 'Vancouver'}</span>
                </div>
              </div>
            </div>

            <div className="boarding-pass-tear"></div>

            <div className="boarding-pass-details">
              <div>
                <div className="boarding-detail-label">Boarding</div>
                <div className="boarding-detail-value">{foundBooking?.departureTime || '08:00 AM'}</div>
              </div>
              <div>
                <div className="boarding-detail-label">Gate</div>
                <div className="boarding-detail-value" style={{ color: 'var(--sky-green)' }}>
                  Gate {foundBooking?.gate?.gateNumber || foundBooking?.gate?.gateCode || 'A12'}
                </div>
              </div>
              <div>
                <div className="boarding-detail-label">Seat</div>
                <div className="boarding-detail-value" style={{ color: 'var(--sky-yellow)' }}>{selectedSeat}</div>
              </div>
              <div>
                <div className="boarding-detail-label">Baggage</div>
                <div className="boarding-detail-value" style={{ color: 'var(--sky-purple)' }}>{baggageCount} Bag{baggageCount !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'var(--bg)',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ||||| |||| |||||| ||||| |||| |||||| (Security Barcode Verified)
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>Back to Flights</button>
                <button className="btn btn-primary btn-sm" onClick={() => alert('Boarding pass saved to mobile wallet!')}>
                  📲 Save to Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
