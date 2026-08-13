import { useState } from 'react';

export default function CheckInPage() {
  const [step, setStep] = useState(1);
  const [pnr, setPnr] = useState('AP-98214');
  const [lastName, setLastName] = useState('Doe');
  const [selectedSeat, setSelectedSeat] = useState('14A');

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
    <div className="page-container" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <div className="page-header-text" style={{ alignItems: 'center' }}>
          <h1>Self-Service Check-In</h1>
          <p className="page-subtitle">Complete check-in, select your seat, and generate your mobile boarding pass.</p>
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

        <div className={`wizard-connector ${step > 1 ? 'filled' : step === 1 ? '' : ''}`}></div>

        <div className={`wizard-step ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>
          <div className={`wizard-circle ${step === 2 ? 'active' : step > 2 ? 'completed' : 'pending'}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <span className="wizard-label">Select Seat</span>
        </div>

        <div className={`wizard-connector ${step > 2 ? 'filled' : ''}`}></div>

        <div className={`wizard-step ${step >= 3 ? 'active completed' : ''}`}>
          <div className={`wizard-circle ${step >= 3 ? 'completed' : 'pending'}`}>
            {step >= 3 ? '✓' : '3'}
          </div>
          <span className="wizard-label">Boarding Pass</span>
        </div>
      </div>

      {/* Step 1: Lookup Form */}
      {step === 1 && (
        <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--sky-blue)', animation: 'fadeInUp 0.4s var(--ease)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="metric-icon blue" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>🎫</div>
            <div>
              <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Enter Reservation Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Look up your booking to begin check-in</p>
            </div>
          </div>
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
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                🔍 Find Flight Reservation ➔
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Seat Selector */}
      {step === 2 && (
        <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--sky-green)', animation: 'fadeInUp 0.4s var(--ease)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="metric-icon green" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>💺</div>
              <div>
                <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Select Preferred Seat</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Air Canada AC102 • YYT ➔ YYZ</p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>◀ Change PNR</button>
          </div>

          {/* Seat Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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

          {/* Seat Grid */}
          <div className="seat-grid" style={{ margin: '1.5rem 0' }}>
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

          {selectedSeat && (
            <div className="glass-card" style={{
              padding: '1rem', textAlign: 'center',
              background: 'var(--sky-blue-light)', borderColor: 'rgba(59, 130, 246, 0.2)',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selected Seat: </span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>{selectedSeat}</strong>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-success btn-lg" onClick={handleConfirmSeat}>
              Confirm Check-In & Generate Pass ➔
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Boarding Pass */}
      {step === 3 && (
        <div style={{ animation: 'bounceIn 0.6s var(--ease-spring)' }}>
          {/* Success Message */}
          <div className="success-check" style={{ marginBottom: '1.5rem' }}>
            <div className="success-check-circle">✅</div>
            <h2 style={{ color: 'var(--sky-green)', margin: 0 }}>Check-In Complete!</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Your digital boarding pass is ready below.</p>
          </div>

          <div className="boarding-pass">
            <div className="boarding-pass-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🛫</span>
                <div>
                  <strong style={{ fontSize: '1.1rem', display: 'block' }}>Air Canada • AC102</strong>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>PNR: {pnr} • PASSENGER: {lastName.toUpperCase()}, JANE</span>
                </div>
              </div>
              <span className="badge-status on-time" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                ✓ Checked-In
              </span>
            </div>

            <div className="boarding-pass-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FROM</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-h)', fontFamily: 'var(--font-heading)' }}>YYT</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>St. Johns</span>
                </div>
                <div style={{ color: 'var(--sky-blue)', fontSize: '1.5rem' }}>✈️ ➔</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TO</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>YYZ</div>
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
                <div className="boarding-detail-value" style={{ color: 'var(--sky-green)' }}>A2</div>
              </div>
              <div>
                <div className="boarding-detail-label">Seat</div>
                <div className="boarding-detail-value" style={{ color: 'var(--sky-yellow)' }}>{selectedSeat}</div>
              </div>
              <div>
                <div className="boarding-detail-label">Zone</div>
                <div className="boarding-detail-value">Zone 2</div>
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
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>Check-In Another</button>
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
