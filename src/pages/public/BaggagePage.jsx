import { useState } from 'react';

export default function BaggagePage() {
  const [bagTag, setBagTag] = useState('BG-908211');

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Baggage Management</h1>
          <p className="page-subtitle">Self-service baggage addition and tracking template.</p>
        </div>
      </div>

      {/* Baggage Lookup Form */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-h)' }}>🧳 Track Your Luggage</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Baggage Tag ID or Booking Ref</label>
            <input
              type="text"
              className="input-control"
              value={bagTag}
              onChange={(e) => setBagTag(e.target.value)}
              placeholder="e.g. BG-908211"
            />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" style={{ height: '42px' }}>
              Track Baggage
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Timeline Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Tag: {bagTag} &bull; Standard Checked Bag (23 kg)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned to Flight AC102 (YYT ➔ YYZ)</span>
          </div>
          <span className="badge-status in-transit"><span className="badge-dot"></span>In Flight</span>
        </div>

        {/* Timeline Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '1.5rem' }}>✅</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', marginTop: '0.4rem' }}>Checked-In</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>07:15 AM (Counter 4)</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '1.5rem' }}>🔍</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', marginTop: '0.4rem' }}>Security Cleared</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>07:30 AM</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '1.5rem' }}>🚜</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', marginTop: '0.4rem' }}>Loaded on Aircraft</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>08:10 AM (Cargo Hold B)</div>
          </div>

          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
            <div style={{ fontSize: '1.5rem' }}>✈️</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', marginTop: '0.4rem' }}>In Transit</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>En Route to YYZ</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>🏬</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Baggage Carousel</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected: Carousel 4</div>
          </div>
        </div>
      </div>
    </div>
  );
}

