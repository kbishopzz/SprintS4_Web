import { useState, useEffect, useCallback } from 'react';
import { planeApi, airlineApi } from '../../api/ApiClient';

const emptyAircraft = {
  tailNumber: '',
  type: '',
  manufacturer: 'Boeing',
  numOfPassengers: 180,
  airlineId: '',
  airlineName: '',
  status: 'ACTIVE',
};

export default function AircraftAdmin() {
  const [fleet, setFleet]         = useState([]);
  const [airlines, setAirlines]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen]           = useState(false);
  const [editingPlane, setEditingPlane]     = useState(null); // null = Create Mode
  const [form, setForm]                     = useState(emptyAircraft);
  const [formError, setFormError]           = useState('');
  const [formLoading, setFormLoading]       = useState(false);

  // Modal State: Inspect Logs / Info
  const [inspectPlane, setInspectPlane]     = useState(null);
  const [inspectAirports, setInspectAirports] = useState([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [planesRes, airlinesRes] = await Promise.allSettled([
        planeApi.getAll(),
        airlineApi.getAll(),
      ]);

      if (planesRes.status === 'fulfilled' && Array.isArray(planesRes.value.data)) {
        setFleet(planesRes.value.data);
      } else {
        setFleet([]);
      }

      if (airlinesRes.status === 'fulfilled' && Array.isArray(airlinesRes.value.data)) {
        setAirlines(airlinesRes.value.data);
      } else {
        setAirlines([]);
      }
    } catch (err) {
      console.error('[AircraftAdmin] Fetch error:', err);
      setError('Failed to load fleet inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingPlane(null);
    setForm({
      ...emptyAircraft,
      airlineId: airlines[0]?.id ? String(airlines[0].id) : '',
      airlineName: airlines[0]?.name || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (plane) => {
    setEditingPlane(plane);
    setForm({
      tailNumber: plane.tailNumber || `C-F${100 + (plane.id || plane.ID || 100)}`,
      type: plane.type || plane.model || '',
      manufacturer: plane.manufacturer || 'Boeing',
      numOfPassengers: plane.numOfPassengers || plane.capacity || 180,
      airlineId: plane.airline?.id ? String(plane.airline.id) : (airlines[0]?.id ? String(airlines[0].id) : ''),
      airlineName: plane.airlineName || plane.airline?.name || '',
      status: plane.status || 'ACTIVE',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleInspectLogs = async (plane) => {
    setInspectPlane(plane);
    setInspectLoading(true);
    setInspectAirports([]);
    try {
      const res = await planeApi.getAirports(plane.id || plane.ID);
      setInspectAirports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[AircraftAdmin] Inspect error:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type.trim()) {
      setFormError('Aircraft type/model is required.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    const selectedAirline = airlines.find(a => String(a.id) === String(form.airlineId));

    const payload = {
      type: form.type.trim(),
      manufacturer: form.manufacturer,
      tailNumber: form.tailNumber.trim() || `C-F${Math.floor(100 + Math.random() * 800)}`,
      numOfPassengers: Number(form.numOfPassengers) || 150,
      airlineName: selectedAirline ? selectedAirline.name : form.airlineName,
      status: form.status,
      ...(selectedAirline ? { airline: { id: selectedAirline.id } } : {}),
    };

    try {
      if (editingPlane) {
        const id = editingPlane.id || editingPlane.ID;
        const res = await planeApi.update(id, payload);
        setFleet(fleet.map(p => (p.id || p.ID) === id ? (res.data || { ...p, ...payload }) : p));
      } else {
        const res = await planeApi.create(payload);
        setFleet([...fleet, res.data || { id: Date.now(), ...payload }]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[AircraftAdmin] Save error:', err);
      setFormError('Could not save aircraft to database.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const id = deleteTarget.id || deleteTarget.ID;
    try {
      await planeApi.delete(id);
      setFleet(fleet.filter(p => (p.id || p.ID) !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[AircraftAdmin] Delete error:', err);
      alert('Could not delete aircraft. It may have associated passenger bookings.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Aircraft</h1>
          <p className="page-subtitle">Monitor fleet inventory, passenger capacity, and maintenance status.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Aircraft
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Fleet Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-icon blue">🛩️</div>
          <div className="metric-details">
            <span className="metric-value">{fleet.length}</span>
            <span className="metric-label">Total Fleet Size</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">✅</div>
          <div className="metric-details">
            <span className="metric-value">{fleet.filter(a => (a.status || 'ACTIVE') === 'ACTIVE').length}</span>
            <span className="metric-label">Active Aircraft</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">🔧</div>
          <div className="metric-details">
            <span className="metric-value">{fleet.filter(a => a.status === 'MAINTENANCE').length}</span>
            <span className="metric-label">In Maintenance</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div> Loading Aircraft Fleet...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tail #</th>
                <th>Model / Type</th>
                <th>Manufacturer & Airline</th>
                <th>Passenger Capacity</th>
                <th>Operational Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map((a) => {
                const id = a.id || a.ID;
                const tail = a.tailNumber || `C-F${100 + Number(id)}`;
                const manufacturer = a.manufacturer || (a.type?.includes('Airbus') ? 'Airbus' : 'Boeing');
                const capacity = a.numOfPassengers || a.capacity || 150;
                const status = a.status || 'ACTIVE';

                return (
                  <tr key={id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>{tail}</td>
                    <td style={{ fontWeight: 600 }}>{a.type || a.model || 'Aircraft'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{manufacturer}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.airlineName || a.airline?.name || 'Partner Fleet'}</div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        color: 'var(--sky-blue)',
                        fontSize: '1.05rem'
                      }}>{capacity}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>seats</span>
                    </td>
                    <td>
                      <span className={`badge-status ${status === 'ACTIVE' ? 'active' : 'maintenance'}`}>
                        <span className="badge-dot"></span>{status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(a)}>Edit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleInspectLogs(a)}>Logs</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Aircraft Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header green">
              <h3>{editingPlane ? '✏️ Edit Aircraft' : '🛩️ Add New Aircraft'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {formError && <div className="alert alert-error">{formError}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tail / Registration Number</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. C-FJZU"
                      value={form.tailNumber}
                      onChange={(e) => setForm({ ...form, tailNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Aircraft Model / Type *</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. Boeing 737 MAX 8"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer</label>
                    <select
                      className="input-control"
                      value={form.manufacturer}
                      onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    >
                      <option value="Boeing">Boeing</option>
                      <option value="Airbus">Airbus</option>
                      <option value="Embraer">Embraer</option>
                      <option value="Bombardier">Bombardier / De Havilland</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seat Capacity</label>
                    <input
                      type="number"
                      className="input-control"
                      placeholder="180"
                      value={form.numOfPassengers}
                      onChange={(e) => setForm({ ...form, numOfPassengers: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Operating Airline</label>
                    <select
                      className="input-control"
                      value={form.airlineId}
                      onChange={(e) => {
                        const sel = airlines.find(a => String(a.id) === e.target.value);
                        setForm({ ...form, airlineId: e.target.value, airlineName: sel?.name || form.airlineName });
                      }}
                    >
                      <option value="">-- Select Airline --</option>
                      {airlines.map((al) => (
                        <option key={al.id} value={al.id}>{al.name} ({al.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="input-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="STORED">STORED</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editingPlane ? 'Save Changes' : 'Save Aircraft')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Logs / Aircraft Info Modal */}
      {inspectPlane && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header blue">
              <h3>📋 Aircraft Operational Logs — #{inspectPlane.id || inspectPlane.ID}</h3>
              <button className="btn-icon" onClick={() => setInspectPlane(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <div><strong>Model:</strong> {inspectPlane.type || inspectPlane.model}</div>
                <div><strong>Tail Number:</strong> {inspectPlane.tailNumber || `C-F${100 + Number(inspectPlane.id || inspectPlane.ID)}`}</div>
                <div><strong>Airline:</strong> {inspectPlane.airlineName || inspectPlane.airline?.name || 'N/A'}</div>
                <div><strong>Capacity:</strong> {inspectPlane.numOfPassengers || inspectPlane.capacity} passengers</div>
              </div>

              <h4 style={{ color: 'var(--text-h)' }}>🛫 Associated Airports & Flight Hubs</h4>
              {inspectLoading ? (
                <div className="loading-center"><div className="spinner"></div> Loading hubs...</div>
              ) : inspectAirports.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {inspectAirports.map(ap => (
                    <div key={ap.id} className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{ap.name} ({ap.airportCode})</strong>
                      <span className="badge-status available">Connected</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No airport hubs directly assigned.</div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setInspectPlane(null)}>Close Logs</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '420px' }}>
            <div className="modal-header red">
              <h3>🗑️ Delete Aircraft</h3>
              <button className="btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove <strong>{deleteTarget.type || deleteTarget.model}</strong> ({deleteTarget.tailNumber || `ID #${deleteTarget.id || deleteTarget.ID}`}) from the fleet?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Remove Aircraft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
