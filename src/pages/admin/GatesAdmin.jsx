import { useState, useEffect, useCallback } from 'react';
import { gateApi, airportApi, bookingApi } from '../../api/ApiClient';

const emptyGate = {
  gateNumber: '',
  terminal: 'Terminal 1',
  airportId: '',
  status: 'AVAILABLE',
  currentFlight: 'None',
};

export default function GatesAdmin() {
  const [gates, setGates]         = useState([]);
  const [airports, setAirports]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingGate, setEditingGate]     = useState(null); // null = Create Mode
  const [form, setForm]                   = useState(emptyGate);
  const [formError, setFormError]         = useState('');
  const [formLoading, setFormLoading]     = useState(false);

  // Modal State: Assign Flight
  const [assignModalOpen, setAssignModalOpen]   = useState(false);
  const [assignGate, setAssignGate]             = useState(null);
  const [assignFlightNo, setAssignFlightNo]     = useState('');
  const [assignStatus, setAssignStatus]         = useState('OCCUPIED');
  const [assignLoading, setAssignLoading]       = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [gatesRes, airportsRes, bookingsRes] = await Promise.allSettled([
        gateApi.getAll(),
        airportApi.getAll(),
        bookingApi.getAll(),
      ]);

      const rawGates = gatesRes.status === 'fulfilled' && Array.isArray(gatesRes.value.data) ? gatesRes.value.data : [];
      const bookings = bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data) ? bookingsRes.value.data : [];

      const syncedGates = rawGates.map(g => {
        const assigned = bookings.find(b => b.gate && (b.gate.id === g.id || b.gate.gateCode === g.gateCode || b.gate.gateNumber === g.gateNumber));
        if (assigned) {
          return {
            ...g,
            currentFlight: assigned.flightNumber || g.currentFlight || 'None',
            status: (g.status && g.status !== 'AVAILABLE') ? g.status : (assigned.status || 'OCCUPIED'),
          };
        }
        return g;
      });

      setGates(syncedGates);

      if (airportsRes.status === 'fulfilled' && Array.isArray(airportsRes.value.data)) {
        setAirports(airportsRes.value.data);
      } else {
        setAirports([]);
      }
    } catch (err) {
      console.error('[GatesAdmin] Fetch error:', err);
      setError('Failed to load gates data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingGate(null);
    setForm({
      ...emptyGate,
      airportId: airports[0]?.id ? String(airports[0].id) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (gate) => {
    setEditingGate(gate);
    setForm({
      gateNumber: gate.gateNumber || gate.gateCode || '',
      terminal: gate.terminal || 'Terminal 1',
      airportId: gate.airport?.id ? String(gate.airport.id) : (airports[0]?.id ? String(airports[0].id) : ''),
      status: gate.status || 'AVAILABLE',
      currentFlight: gate.currentFlight || 'None',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openAssignModal = (gate) => {
    setAssignGate(gate);
    setAssignFlightNo(gate.currentFlight && gate.currentFlight !== 'None' ? gate.currentFlight : 'AC102');
    setAssignStatus(gate.status === 'AVAILABLE' ? 'BOARDING' : gate.status);
    setAssignModalOpen(true);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.gateNumber.trim()) {
      setFormError('Gate designation is required.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    const payload = {
      gateNumber: form.gateNumber.trim(),
      gateCode: form.gateNumber.trim(),
      terminal: form.terminal,
      status: form.status,
      currentFlight: form.currentFlight,
      ...(form.airportId ? { airport: { id: Number(form.airportId) } } : {}),
    };

    try {
      if (editingGate) {
        const res = await gateApi.update(editingGate.id, payload);
        setGates(gates.map(g => g.id === editingGate.id ? (res.data || { ...g, ...payload }) : g));
      } else {
        const res = await gateApi.create(payload);
        setGates([...gates, res.data || { id: Date.now(), ...payload }]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[GatesAdmin] Save error:', err);
      setFormError('Failed to save gate. Please check backend connection.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignGate) return;
    setAssignLoading(true);

    const updatedPayload = {
      currentFlight: assignFlightNo.trim() || 'None',
      status: assignStatus,
    };

    try {
      const res = await gateApi.update(assignGate.id, updatedPayload);
      setGates(gates.map(g => g.id === assignGate.id ? (res.data || { ...g, ...updatedPayload }) : g));
      setAssignModalOpen(false);
    } catch (err) {
      console.error('[GatesAdmin] Assign flight error:', err);
      alert('Could not update gate assignment.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleToggleStatus = async (gate) => {
    const statusCycle = ['AVAILABLE', 'BOARDING', 'OCCUPIED', 'MAINTENANCE'];
    const currentIdx = statusCycle.indexOf(gate.status || 'AVAILABLE');
    const nextStatus = statusCycle[(currentIdx + 1) % statusCycle.length];

    try {
      const res = await gateApi.update(gate.id, { status: nextStatus });
      setGates(gates.map(g => g.id === gate.id ? (res.data || { ...g, status: nextStatus }) : g));
    } catch (err) {
      console.error('[GatesAdmin] Toggle status error:', err);
      // Fallback local update
      setGates(gates.map(g => g.id === gate.id ? { ...g, status: nextStatus } : g));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await gateApi.delete(deleteTarget.id);
      setGates(gates.filter(g => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[GatesAdmin] Delete error:', err);
      alert('Could not delete gate. It may be referenced by active bookings.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render Badges ──────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return <span className="badge-status available"><span className="badge-dot"></span>Available</span>;
      case 'BOARDING':  return <span className="badge-status boarding"><span className="badge-dot"></span>Boarding</span>;
      case 'OCCUPIED':  return <span className="badge-status on-time"><span className="badge-dot"></span>Occupied</span>;
      default:           return <span className="badge-status maintenance"><span className="badge-dot"></span>Maintenance</span>;
    }
  };

  const getGateCardColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'var(--sky-green-light)', border: 'rgba(34, 197, 94, 0.3)', color: 'var(--sky-green)' };
      case 'BOARDING':  return { bg: 'var(--sky-blue-light)', border: 'rgba(59, 130, 246, 0.3)', color: 'var(--sky-blue)' };
      case 'OCCUPIED':  return { bg: 'var(--sky-cyan-light)', border: 'rgba(6, 182, 212, 0.3)', color: 'var(--sky-cyan)' };
      default:           return { bg: 'var(--sky-yellow-light)', border: 'rgba(234, 179, 8, 0.3)', color: 'var(--sky-yellow)' };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Gates</h1>
          <p className="page-subtitle">Terminal gate assignments, occupancy tracking, and jet bridge status.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Gate
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Gate Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-icon blue">🚪</div>
          <div className="metric-details">
            <span className="metric-value">{gates.length}</span>
            <span className="metric-label">Total Gates</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">✅</div>
          <div className="metric-details">
            <span className="metric-value">{gates.filter(g => (g.status || 'AVAILABLE') === 'AVAILABLE').length}</span>
            <span className="metric-label">Available</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">🔧</div>
          <div className="metric-details">
            <span className="metric-value">{gates.filter(g => g.status === 'MAINTENANCE').length}</span>
            <span className="metric-label">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Gate Status Mini-Cards Grid */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-h)' }}>🗺️ Gate Overview</h3>
        <div className="card-grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {gates.map((g) => {
            const colors = getGateCardColor(g.status || 'AVAILABLE');
            const flight = g.currentFlight && g.currentFlight !== 'None' ? g.currentFlight : null;
            return (
              <div key={g.id} className="glass-card" style={{
                padding: '1rem',
                borderLeft: `4px solid ${colors.color}`,
                background: colors.bg,
                textAlign: 'center',
                transition: 'all 0.3s var(--ease)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: colors.color,
                  marginBottom: '0.4rem'
                }}>
                  Gate {g.gateNumber || g.gateCode || `#${g.id}`}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  {g.terminal || 'Main Terminal'} {g.airport?.airportCode ? `(${g.airport.airportCode})` : ''}
                </div>
                {flight ? (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-h)' }}>
                    ✈️ {flight}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No Flight</div>
                )}
                <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(g.status || 'AVAILABLE')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gate Details Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div> Loading Terminal Gates...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Gate Designation</th>
                <th>Terminal & Airport</th>
                <th>Current Flight</th>
                <th>Gate Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gates.map((g) => {
                const flight = g.currentFlight && g.currentFlight !== 'None' ? g.currentFlight : null;
                return (
                  <tr key={g.id}>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        background: 'var(--sky-blue-light)',
                        color: 'var(--sky-blue)',
                        padding: '0.25rem 0.7rem',
                        borderRadius: 'var(--radius-xs)'
                      }}>Gate {g.gateNumber || g.gateCode || `#${g.id}`}</span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-h)' }}>
                      {g.terminal || 'Main Terminal'}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {g.airport?.name || 'Unassigned Airport'}
                      </div>
                    </td>
                    <td>
                      {flight ? (
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--sky-blue)', fontWeight: '700' }}>✈️ {flight}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No Flight Assigned</span>
                      )}
                    </td>
                    <td>{getStatusBadge(g.status || 'AVAILABLE')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openAssignModal(g)}>Assign Flight</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggleStatus(g)}>Toggle Status</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(g)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(g)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Gate Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header blue">
              <h3>{editingGate ? '✏️ Edit Terminal Gate' : '🚪 Add Terminal Gate'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {formError && <div className="alert alert-error">{formError}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Gate Number / Code *</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. A12"
                      value={form.gateNumber}
                      onChange={(e) => setForm({ ...form, gateNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Terminal Designation</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. Terminal 1"
                      value={form.terminal}
                      onChange={(e) => setForm({ ...form, terminal: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Airport</label>
                  <select
                    className="input-control"
                    value={form.airportId}
                    onChange={(e) => setForm({ ...form, airportId: e.target.value })}
                  >
                    <option value="">-- Select Airport --</option>
                    {airports.map((ap) => (
                      <option key={ap.id} value={ap.id}>{ap.name} ({ap.airportCode})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Gate Status</label>
                    <select
                      className="input-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BOARDING">BOARDING</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Flight #</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. AC102 or None"
                      value={form.currentFlight}
                      onChange={(e) => setForm({ ...form, currentFlight: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editingGate ? 'Save Changes' : 'Create Gate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Flight Modal */}
      {assignModalOpen && assignGate && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '420px' }}>
            <div className="modal-header cyan">
              <h3>✈️ Assign Flight to Gate {assignGate.gateNumber || assignGate.gateCode}</h3>
              <button className="btn-icon" onClick={() => setAssignModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Flight Number</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. AC108 or None"
                    value={assignFlightNo}
                    onChange={(e) => setAssignFlightNo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Update Gate Operational Status</label>
                  <select
                    className="input-control"
                    value={assignStatus}
                    onChange={(e) => setAssignStatus(e.target.value)}
                  >
                    <option value="BOARDING">BOARDING</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="AVAILABLE">AVAILABLE (Unassign)</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assignLoading}>
                  {assignLoading ? 'Assigning...' : 'Update Gate Assignment'}
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
              <h3>🗑️ Delete Terminal Gate</h3>
              <button className="btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>Gate {deleteTarget.gateNumber || deleteTarget.gateCode}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete Gate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
