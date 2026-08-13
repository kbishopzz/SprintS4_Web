export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span style={{ fontSize: '1.2rem' }}>🛫</span>
          <span>AeroPulse • SkyOps Platform</span>
        </div>
        <div className="footer-status">
          <span className="status-indicator"></span>
          <span>All Systems Operational</span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Accessibility</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Help Centre</span>
        </div>
        <span>© 2026 AeroPulse Aviation Systems — SDAT Final Sprint Project</span>
      </div>
    </footer>
  );
}
