export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span>✈️ AeroPulse Aviation System</span>
        </div>
        <div className="footer-status">
          <span className="status-indicator"></span>
          <span>All Flight Operations & API Gateway Nominal</span>
        </div>
      </div>
      <p style={{ textAlign: 'center', margin: 0 }}>
        Aviation System &copy; {new Date().getFullYear()} - Keyin SDAT Final Sprint
      </p>
    </footer>
  );
}

