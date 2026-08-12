import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [passport, setPassport] = useState('A12345678');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    alert('Booking confirmed! Redirecting to your dashboard...');
    navigate('/my-bookings');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Checkout & Payment</h1>
          <p className="page-subtitle">Passenger details and checkout template.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Passenger Information Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-h)' }}>📋 Passenger Information</h3>
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

            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-h)' }}>💳 Payment Method</h3>
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

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.85rem' }}>
              🔒 Complete & Pay $384.20 CAD
            </button>
          </form>
        </div>

        {/* Flight & Fare Breakdown Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>✈️ Order Summary</h3>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-h)' }}>Air Canada AC102</span>
                <span className="badge-status on-time">Confirmed</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                St. Johns (YYT) ➔ Toronto (YYZ)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Date: Aug 20, 2026 &bull; 08:30 AM
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Airfare (1x Economy)</span>
                <span>$349.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Airport Taxes & Fees</span>
                <span>$35.20</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-h)' }}>
                <span>Total Due</span>
                <span style={{ color: '#38bdf8' }}>$384.20 CAD</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ background: 'var(--accent-light)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <h4 style={{ color: '#a5b4fc', marginBottom: '0.5rem' }}>🛡️ Passenger Protection Included</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Free cancellation within 24 hours of booking and instant digital boarding pass delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

