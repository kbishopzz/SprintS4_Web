import { useState } from 'react';

export default function BaggagePage() {
  const [bagTag, setBagTag] = useState('BG-908211');

  const trackingSteps = [
    { icon: '✅', label: 'Checked-In', detail: '07:15 AM (Counter 4)', completed: true },
    { icon: '🔍', label: 'Security Cleared', detail: '07:30 AM', completed: true },
    { icon: '🚜', label: 'Loaded on Aircraft', detail: '08:10 AM (Cargo Hold B)', completed: true },
    { icon: '✈️', label: 'In Transit', detail: 'En Route to YYZ', completed: false, active: true },
    { icon: '🏬', label: 'Baggage Carousel', detail: 'Expected: Carousel 4', completed: false },
  ];

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
              🔍 Track Baggage
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-h)', margin: 0 }}>Tag: {bagTag} • Standard Checked Bag (23 kg)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned to Flight AC102 (YYT ➔ YYZ)</span>
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

      {/* Baggage Info Cards */}
      <div className="card-grid-3">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-blue)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📏</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Size & Weight</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            62 × 45 × 25 cm • <strong>18.5 kg</strong> / 23 kg max
          </p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-green)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Priority Tag</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Silver Medallion — <strong style={{ color: 'var(--sky-green)' }}>Priority Handling</strong>
          </p>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--sky-yellow)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
          <h4 style={{ color: 'var(--text-h)', marginBottom: '0.25rem' }}>Estimated Arrival</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Carousel 4 • <strong>~10:55 AM local</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
