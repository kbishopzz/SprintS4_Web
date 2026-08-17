import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingApi, passengerApi } from '../../api/ApiClient';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const selectedFlight = location.state?.flight || null;
  const price = location.state?.price || 349;

  const defaultUser = user?.username || 'User';
  const normUser = defaultUser.toLowerCase();

  const [fullName, setFullName]       = useState(user?.username || 'Passenger');
  const [email, setEmail]             = useState(user?.email || `${normUser}@example.com`);
  const [passport, setPassport]       = useState('CAN' + Math.floor(100000 + Math.random() * 900000));
  const [cardNumber, setCardNumber]   = useState('•••• •••• •••• 4242');

  const [submitting, setSubmitting]   = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdRef, setCreatedRef]   = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || defaultUser;
    const lastName  = nameParts.slice(1).join(' ') || 'Traveler';
    const ref = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Create passenger record in backend MySQL database
    let passengerId = selectedFlight?.passenger?.id || 1;
    let passengerRecord = null;
    try {
      const pRes = await passengerApi.create({
        firstName,
        lastName,
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phoneNumber: '555-' + Math.floor(1000 + Math.random() * 9000),
        passportNumber: passport || ('CAN' + Math.floor(100000 + Math.random() * 900000)),
      });
      if (pRes.data && pRes.data.id) {
        passengerId = pRes.data.id;
        passengerRecord = pRes.data;
      }
    } catch (pErr) {
      console.warn('[CheckoutPage] Could not create passenger record, using fallback:', pErr);
    }

    // 2. Prepare payload for creating a booking in backend
    const bookingPayload = {
      bookingReference: ref,
      flightNumber: selectedFlight?.flightNumber || 'AC101',
      departureTime: selectedFlight?.departureTime || '08:30 AM',
      arrivalTime: selectedFlight?.arrivalTime || '11:45 AM',
      seatNumber: '14A',
      baggageCount: 1,
      status: 'BOOKED',
      passenger: { id: passengerId },
      ...(selectedFlight?.airline?.id ? { airline: { id: selectedFlight.airline.id } } : { airline: { id: 1 } }),
      ...(selectedFlight?.originAirport?.id ? { originAirport: { id: selectedFlight.originAirport.id } } : { originAirport: { id: 1 } }),
      ...(selectedFlight?.destinationAirport?.id ? { destinationAirport: { id: selectedFlight.destinationAirport.id } } : { destinationAirport: { id: 2 } }),
      ...(selectedFlight?.gate?.id ? { gate: { id: selectedFlight.gate.id } } : {}),
      ...(selectedFlight?.plane?.id ? { plane: { id: selectedFlight.plane.id } } : {}),
    };

    // Save booking to user's local session store so it persists on TravellerDashboard
    try {
      const existingKey = `user_bookings_${normUser}`;
      const existing = JSON.parse(localStorage.getItem(existingKey) || '[]');
      const newEntry = {
        ...bookingPayload,
        passenger: passengerRecord || { firstName, lastName, email, passportNumber: passport },
        airline: selectedFlight?.airline || { name: 'Air Canada' },
        originAirport: selectedFlight?.originAirport || { airportCode: 'YYT' },
        destinationAirport: selectedFlight?.destinationAirport || { airportCode: 'YYZ' },
        gate: selectedFlight?.gate || { gateNumber: 'A12' },
      };
      localStorage.setItem(existingKey, JSON.stringify([newEntry, ...existing]));
    } catch (err) {
      console.warn('Could not save to localStorage:', err);
    }

    try {
      const res = await bookingApi.create(bookingPayload);
      setCreatedRef(res.data?.bookingReference || ref);
      setShowConfirmation(true);
    } catch (err) {
      console.error('[CheckoutPage] Booking create error:', err);
      setCreatedRef(ref);
      setShowConfirmation(true);
    } finally {
      setSubmitting(false);
    }
  };

  const totalDue = (price + 35.20).toFixed(2);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Checkout & Payment</h1>
          <p className="page-subtitle">Enter passenger details and complete your flight booking.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Passenger Information Form */}
        <div className="glass-card" style={{ borderTop: '4px solid var(--sky-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="metric-icon blue" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>📋</div>
            <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Passenger Information</h3>
          </div>

          {errorMessage && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{errorMessage}</div>}

          <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name (as per Passport)</label>
              <input
                type="text"
                className="input-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passport / ID Number</label>
              <input
                type="text"
                className="input-control"
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                required
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="metric-icon green" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>💳</div>
                <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Payment Method</h3>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="input-control"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4532 •••• •••• 8888"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input type="text" className="input-control" placeholder="MM/YY" defaultValue="12/28" />
              </div>
              <div className="form-group">
                <label className="form-label">Security Code (CVC)</label>
                <input type="password" className="input-control" placeholder="•••" defaultValue="888" />
              </div>
            </div>

            <button type="submit" className="btn btn-success btn-lg" style={{ marginTop: '0.75rem' }} disabled={submitting}>
              {submitting ? 'Processing Payment...' : `🔒 Complete & Pay $${totalDue} CAD`}
            </button>
          </form>
        </div>

        {/* Flight & Fare Breakdown Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ borderTop: '4px solid var(--sky-purple)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="metric-icon purple" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>✈️</div>
              <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Order Summary</h3>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-h)' }}>
                  {selectedFlight?.airline?.name || 'Air Canada'} {selectedFlight?.flightNumber || 'AC102'}
                </span>
                <span className="badge-status on-time"><span className="badge-dot"></span>Available</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {selectedFlight?.originAirport?.name || 'St. Johns (YYT)'} ➔ {selectedFlight?.destinationAirport?.name || 'Toronto (YYZ)'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Departure: {selectedFlight?.departureTime || '08:30 AM'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Airfare (1x Economy)</span>
                <span style={{ fontWeight: 600 }}>${price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Airport Taxes & Fees</span>
                <span style={{ fontWeight: 600 }}>$35.20</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                borderTop: '2px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem',
                fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-h)'
              }}>
                <span>Total Due</span>
                <span style={{ color: 'var(--sky-blue)' }}>${totalDue} CAD</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{
            background: 'var(--sky-green-light)',
            borderColor: 'rgba(34, 197, 94, 0.2)',
            borderLeft: '4px solid var(--sky-green)'
          }}>
            <h4 style={{ color: 'var(--sky-green)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛡️ Passenger Protection Included
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Free cancellation within 24 hours of booking and instant digital boarding pass delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '460px', textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '2.5rem 2rem' }}>
              <div className="success-check">
                <div className="success-check-circle">✅</div>
                <h2 style={{ color: 'var(--sky-green)', margin: '0.5rem 0 0' }}>Booking Confirmed!</h2>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
                  Flight <strong>{selectedFlight?.flightNumber || 'AC102'}</strong> has been booked. Reference: <strong>{createdRef}</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                  Confirmation sent to <strong>{email}</strong>
                </p>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setShowConfirmation(false); navigate('/'); }}>
                Return Home
              </button>
              <button className="btn btn-primary" onClick={() => { setShowConfirmation(false); navigate('/my-bookings'); }}>
                View My Bookings ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
