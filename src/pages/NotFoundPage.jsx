import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-container" style={{ textAlign: 'center', margin: '4rem auto', maxWidth: '500px' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧭</div>
        <h1>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          The flight route or page you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          ✈️ Return to Flight Board
        </Link>
      </div>
    </div>
  );
}

