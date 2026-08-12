import { useState } from 'react';

export default function CheckInPage() {
  const [pnr, setPnr] = useState('AP-98214');
  const [lastName, setLastName] = useState('Doe');
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const handleCheckIn = (e) => {
    e.preventDefault();
    setIsCheckedIn(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Self-Service Check-In</h1>
          <p className="page-subtitle">Check-in and boarding pass retrieval template.</p>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-h)' }}>🎫 Retrieve Booking</h3>
        <form onSubmit={handleCheckIn} className="form-grid">
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
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              🔍 Find & Check-In
            </button>
          </div>
        </form>
      </div>

      {/* Digital Boarding Pass Preview */}
      {isCheckedIn && (
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', border: '1px solid var(--border-focus)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛫</span>
              <div>
                <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Boarding Pass &bull; Air Canada AC102</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PNR: {pnr} &bull; Passenger: {lastName.toUpperCase()}, JANE</span>
              </div>
            </div>
            <span className="badge-status on-time"><span className="badge-dot"></span>Ready for Boarding</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', textTransform: 'uppercase' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>From</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-h)', fontFamily: 'var(--font-heading)' }}>YYT</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>St. Johns</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>To</span>
              <strong style={{ fontSize: '1.3rem', color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>YYZ</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Toronto</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Boarding Time</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>08:00 AM</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Gate</span>
              <strong style={{ fontSize: '1.3rem', color: '#34d399', fontFamily: 'var(--font-heading)' }}>A2</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Seat</span>
              <strong style={{ fontSize: '1.3rem', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>14A</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Zone</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-h)' }}>Zone 2</strong>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>||||| |||| |||||| ||||| |||| ||||||</span>
              <span>(Barcode Demo)</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => alert('Downloading Boarding Pass PDF...')}>
              📲 Download Mobile Pass (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

