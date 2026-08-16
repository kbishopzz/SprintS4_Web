import { useState, useEffect, useCallback } from 'react';
import { airlineApi } from '../../api/ApiClient';

const emptyAirline = { code: '', name: '', country: 'Canada', status: 'PARTNER' };

export default function AirlinesAdmin() {
  const [airlines, setAirlines]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Modal state: Create / Edit
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingAirline, setEditingAirline] = useState(null); // null = Create Mode
  const [form, setForm]                   = useState(emptyAirline);
  const [formError, setFormError]         = useState('');
  const [formLoading, setFormLoading]     = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchAirlines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await airlineApi.getAll();
      if (res.data && Array.isArray(res.data)) {
        setAirlines(res.data.map(a => ({
          id: a.id,
          code: a.code || 'AL',
          name: a.name || 'Airline',
          country: a.country || 'Canada',
          activeFlights: a.activeFlights ?? (a.planes ? a.planes.length * 6 : 12),
          status: a.status || 'PARTNER'
        })));
      } else {
        setAirlines([]);
      }
    } catch (err) {
      console.error('[AirlinesAdmin] Fetch error:', err);
      setError('Could not load airlines from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirlines();
  }, [fetchAirlines]);

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingAirline(null);
    setForm(emptyAirline);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (airline) => {
    setEditingAirline(airline);
    setForm({
      code: airline.code || '',
      name: airline.name || '',
      country: airline.country || 'Canada',
      status: airline.status || 'PARTNER',
    });
    setFormError('');
    setModalOpen(true);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setFormError('Airline code and name are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      country: form.country.trim() || 'Canada',
      status: form.status,
    };

    try {
      if (editingAirline) {
        const res = await airlineApi.update(editingAirline.id, payload);
        setAirlines(airlines.map(a => a.id === editingAirline.id ? (res.data || { ...a, ...payload }) : a));
      } else {
        const res = await airlineApi.create(payload);
        setAirlines([...airlines, res.data || { id: Date.now(), ...payload, activeFlights: 0 }]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[AirlinesAdmin] Save error:', err);
      setFormError('Failed to save airline partner.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await airlineApi.delete(deleteTarget.id);
      setAirlines(airlines.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[AirlinesAdmin] Delete error:', err);
      alert('Could not delete airline partner.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Airlines</h1>
          <p className="page-subtitle">Register airline codes, partner agreements, and contact channels.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Airline Partner
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchAirlines}>Retry</button>
        </div>
      )}

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
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(a)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Airline Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header blue">
              <h3>{editingAirline ? '✏️ Edit Airline Partner' : '🏢 Add Airline Partner'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {formError && <div className="alert alert-error">{formError}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">IATA Code *</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="AC"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Airline Name *</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Air Canada"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Country of Origin</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Canada"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Agreement Tier</label>
                    <select
                      className="input-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="PARTNER">PARTNER</option>
                      <option value="ALLIANCE">STAR ALLIANCE</option>
                      <option value="REGIONAL">REGIONAL</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editingAirline ? 'Save Changes' : 'Save Airline')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '420px' }}>
            <div className="modal-header red">
              <h3>🗑️ Delete Airline Partner</h3>
              <button className="btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.code})?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
