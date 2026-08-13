import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [passport, setPassport] = useState('A12345678');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Checkout & Payment</h1>
          <p className="page-subtitle">Enter passenger details and complete your booking.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Passenger Information Form */}
        <div className="glass-card" style={{ borderTop: '4px solid var(--sky-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="metric-icon blue" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>📋</div>
            <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Passenger Information</h3>
          </div>
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

            <button type="submit" className="btn btn-success btn-lg" style={{ marginTop: '0.75rem' }}>
              🔒 Complete & Pay $384.20 CAD
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
                <span style={{ fontWeight: '700', color: 'var(--text-h)' }}>Air Canada AC102</span>
                <span className="badge-status on-time"><span className="badge-dot"></span>Confirmed</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                St. Johns (YYT) ➔ Toronto (YYZ)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Date: Aug 20, 2026 • 08:30 AM
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Airfare (1x Economy)</span>
                <span style={{ fontWeight: 600 }}>$349.00</span>
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
                <span style={{ color: 'var(--sky-blue)' }}>$384.20 CAD</span>
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
                  Your flight AC102 from YYT to YYZ has been booked successfully.
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
