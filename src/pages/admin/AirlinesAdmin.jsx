import { useState, useEffect } from 'react';
import { airlineApi } from '../../api/ApiClient';

export default function AirlinesAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const initialMockAirlines = [
    { id: 1, code: 'AC', name: 'Air Canada', country: 'Canada', activeFlights: 24, status: 'PARTNER' },
    { id: 2, code: 'WS', name: 'WestJet', country: 'Canada', activeFlights: 16, status: 'PARTNER' },
    { id: 3, code: 'PD', name: 'Porter Airlines', country: 'Canada', activeFlights: 8, status: 'PARTNER' },
    { id: 4, code: 'PB', name: 'PAL Airlines', country: 'Canada', activeFlights: 6, status: 'REGIONAL' },
  ];

  const [airlines, setAirlines] = useState(initialMockAirlines);

  const fetchAirlines = async () => {
    setLoading(true);
    try {
      const res = await airlineApi.getAll();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAirlines(res.data.map(a => ({
          id: a.id,
          code: a.code || 'AL',
          name: a.name || 'Airline',
          country: a.country || 'Canada',
          activeFlights: a.activeFlights || 10,
          status: a.status || 'PARTNER'
        })));
      }
    } catch (err) {
      console.warn('API unavailable, using fallback mock data for Airlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  const handleCreateAirline = async (e) => {
    e.preventDefault();
    const payload = { code: newCode, name: newName, country: newCountry };
    try {
      const res = await airlineApi.create(payload);
      if (res.data) {
        setAirlines([...airlines, res.data]);
      } else {
        setAirlines([...airlines, { id: Date.now(), ...payload, activeFlights: 0, status: 'PARTNER' }]);
      }
    } catch (err) {
      setAirlines([...airlines, { id: Date.now(), ...payload, activeFlights: 0, status: 'PARTNER' }]);
    }
    setNewCode('');
    setNewName('');
    setNewCountry('');
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    try {
      await airlineApi.delete(id);
    } catch (err) {
      console.warn('Delete via API failed, updating local state');
    }
    setAirlines(airlines.filter(a => a.id !== id));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Airlines</h1>
          <p className="page-subtitle">Register airline codes, partner agreements, and contact channels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Airline Partner
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card purple">
          <div className="metric-icon purple">🏢</div>
          <div className="metric-details">
            <span className="metric-value">{airlines.length}</span>
            <span className="metric-label">Total Airlines</span>
          </div>
        </div>
        <div className="metric-card blue">
          <div className="metric-icon blue">✈️</div>
          <div className="metric-details">
            <span className="metric-value">{airlines.reduce((sum, a) => sum + (a.activeFlights || 0), 0)}</span>
            <span className="metric-label">Combined Daily Flights</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">🤝</div>
          <div className="metric-details">
            <span className="metric-value">{airlines.filter(a => a.status === 'PARTNER').length}</span>
            <span className="metric-label">Active Partners</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div> Loading Airlines...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>IATA Code</th>
                <th>Airline Name</th>
                <th>Country</th>
                <th>Active Daily Flights</th>
                <th>Agreement Tier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: 'var(--bg-card)',
                      fontFamily: 'var(--font-mono)',
                      background: 'linear-gradient(135deg, var(--sky-blue), var(--sky-purple))',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.85rem'
                    }}>{a.code}</span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>{a.name}</td>
                  <td>{a.country}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>
                      {a.activeFlights ?? 12}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>flights/day</span>
                  </td>
                  <td>
                    <span className="badge-status active"><span className="badge-dot"></span>{a.status || 'PARTNER'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Airline Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header blue">
              <h3>🏢 Add Airline Partner</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAirline}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">IATA Code</label>
                    <input type="text" className="input-control" placeholder="AC" value={newCode} onChange={(e) => setNewCode(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Airline Name</label>
                    <input type="text" className="input-control" placeholder="Air Canada" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Country of Origin</label>
                  <input type="text" className="input-control" placeholder="Canada" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Airline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
