import { useState } from 'react';

export default function CheckInPage() {
  const [step, setStep] = useState(1);
  const [pnr, setPnr] = useState('AP-98214');
  const [lastName, setLastName] = useState('Doe');
  const [selectedSeat, setSelectedSeat] = useState('14A');

  const availableSeats = ['12A', '12B', '14A', '14C', '15F', '18B', '20D'];

  const handleLookup = (e) => {
    e.preventDefault();
    if (pnr && lastName) {
      setStep(2);
    }
  };

  const handleConfirmSeat = () => {
    setStep(3);
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <div className="page-header-text">
          <h1>Self-Service Check-In</h1>
          <p className="page-subtitle">Complete check-in, select your seat, and generate your mobile boarding pass.</p>
        </div>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', background: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: step >= 1 ? 'var(--accent)' : 'var(--bg-input)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
          }}>1</div>
          <span style={{ fontWeight: step === 1 ? 700 : 400, color: step === 1 ? 'var(--text-h)' : 'var(--text-muted)' }}>1. Retrieve Booking</span>
        </div>

        <span style={{ color: 'var(--text-dim)' }}>➔</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: step >= 2 ? 'var(--accent)' : 'var(--bg-input)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
          }}>2</div>
          <span style={{ fontWeight: step === 2 ? 700 : 400, color: step === 2 ? 'var(--text-h)' : 'var(--text-muted)' }}>2. Select Seat</span>
        </div>

        <span style={{ color: 'var(--text-dim)' }}>➔</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: step >= 3 ? 'var(--emerald)' : 'var(--bg-input)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
          }}>3</div>
          <span style={{ fontWeight: step === 3 ? 700 : 400, color: step === 3 ? 'var(--text-h)' : 'var(--text-muted)' }}>3. Digital Boarding Pass</span>
        </div>
      </div>

      {/* Step 1: Lookup Form */}
      {step === 1 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-h)' }}>🎫 Enter Reservation Details</h3>
          <form onSubmit={handleLookup} className="form-grid">
            <div className="form-group">
              <label className="form-label">Booking Reference (PNR)</label>
              <input
                type="text"
                className="input-control"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="e.g. AP-98214"
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
                placeholder="e.g. Doe"
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                🔍 Find Flight Reservation ➔
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Seat Selector */}
      {step === 2 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ color: 'var(--text-h)' }}>💺 Select Preferred Seat</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Air Canada AC102 &bull; St. Johns (YYT) ➔ Toronto (YYZ)</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>◀ Change PNR</button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
            {availableSeats.map((seat) => (
              <button
                key={seat}
                className={`btn ${selectedSeat === seat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.85rem 1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                onClick={() => setSelectedSeat(seat)}
              >
                Seat {seat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn btn-primary btn-lg" onClick={handleConfirmSeat}>
              Confirm Check-In & Generate Boarding Pass ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Boarding Pass */}
      {step === 3 && (
        <div className="boarding-pass">
          <div className="boarding-pass-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛫</span>
              <div>
                <strong style={{ fontSize: '1.1rem', display: 'block' }}>Air Canada &bull; AC102</strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>PNR: {pnr} &bull; PASSENGER: {lastName.toUpperCase()}, JANE</span>
              </div>
            </div>
            <span className="badge-status on-time" style={{ background: 'white', color: '#059669' }}>
              Checked-In & Verified
            </span>
          </div>

          <div className="boarding-pass-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FROM</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-h)', fontFamily: 'var(--font-heading)' }}>YYT</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>St. Johns</span>
              </div>
              <div style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>✈️ ➔</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TO</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>YYZ</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toronto</span>
              </div>
            </div>
          </div>

          <div className="boarding-pass-tear"></div>

          <div className="boarding-pass-details">
            <div>
              <div className="boarding-detail-label">Boarding</div>
              <div className="boarding-detail-value">08:00 AM</div>
            </div>
            <div>
              <div className="boarding-detail-label">Gate</div>
              <div className="boarding-detail-value" style={{ color: '#34d399' }}>A2</div>
            </div>
            <div>
              <div className="boarding-detail-label">Seat</div>
              <div className="boarding-detail-value" style={{ color: '#fbbf24' }}>{selectedSeat}</div>
            </div>
            <div>
              <div className="boarding-detail-label">Zone</div>
              <div className="boarding-detail-value">Zone 2</div>
            </div>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.8)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ||||| |||| |||||| ||||| |||| |||||| (Security Barcode Verified)
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>Check-In Another</button>
              <button className="btn btn-primary btn-sm" onClick={() => alert('Boarding pass PDF downloaded to mobile wallet!')}>
                📲 Save Pass to Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
