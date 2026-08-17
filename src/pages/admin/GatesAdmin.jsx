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

  // Manifest Modal State
  const [manifestGate, setManifestGate]       = useState(null);
  const [manifestBookings, setManifestBookings] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [manifestFilter, setManifestFilter]   = useState('ALL'); // ALL, CHECKED_IN, PENDING

  const handleOpenManifest = async (gate) => {
    setManifestGate(gate);
    setManifestLoading(true);
    setManifestFilter('ALL');
    try {
      const flight = gate.currentFlight && gate.currentFlight !== 'None' ? gate.currentFlight.trim() : '';
      const res = await bookingApi.getAll();
      const allBookings = res.data || [];
      // Filter bookings matching this gate or flight
      const matched = allBookings.filter(b => 
        (b.gate?.id === gate.id) || 
        (flight && b.flightNumber && b.flightNumber.toLowerCase() === flight.toLowerCase())
      );
      setManifestBookings(matched);
    } catch (err) {
      console.error('[GatesAdmin] Error loading manifest:', err);
      setManifestBookings([]);
    } finally {
      setManifestLoading(false);
    }
  };

  const handleManifestCheckIn = async (bookingId) => {
    try {
      await bookingApi.checkIn(bookingId);
      setManifestBookings(manifestBookings.map(b => 
        b.id === bookingId ? { ...b, status: 'CHECKED_IN', checkInTime: new Date().toISOString().replace('T', ' ').substring(0, 16) } : b
      ));
    } catch (err) {
      console.error('[GatesAdmin] Instant check-in error:', err);
      alert('Could not complete check-in for passenger.');
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
                        <button className="btn btn-primary btn-sm" onClick={() => handleOpenManifest(g)}>
                          👥 Passengers
                        </button>
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

      {/* Passenger Manifest / Check-In List Modal */}
      {manifestGate && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '850px' }}>
            <div className="modal-header blue">
              <div>
                <h3>👥 Gate Manifest &amp; Passenger Check-In List</h3>
                <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.2rem' }}>
                  Gate {manifestGate.gateNumber || manifestGate.gateCode} • {manifestGate.terminal || 'Main Terminal'} ({manifestGate.airport?.airportCode || 'Hub'}) — Active Flight: <strong>{manifestGate.currentFlight && manifestGate.currentFlight !== 'None' ? manifestGate.currentFlight : 'No Scheduled Flight'}</strong>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setManifestGate(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Manifest Summary Bar */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--sky-blue-light)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Booked</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-h)' }}>{manifestBookings.length}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Checked-In</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--sky-green)' }}>
                      {manifestBookings.filter(b => b.status === 'CHECKED_IN' || b.checkInTime).length}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Pending Check-In</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--sky-yellow)' }}>
                      {manifestBookings.filter(b => b.status !== 'CHECKED_IN' && !b.checkInTime).length}
                    </strong>
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className={`btn btn-sm ${manifestFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setManifestFilter('ALL')}
                  >
                    All ({manifestBookings.length})
                  </button>
                  <button
                    className={`btn btn-sm ${manifestFilter === 'CHECKED_IN' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setManifestFilter('CHECKED_IN')}
                  >
                    Checked-In Only ({manifestBookings.filter(b => b.status === 'CHECKED_IN' || b.checkInTime).length})
                  </button>
                  <button
                    className={`btn btn-sm ${manifestFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setManifestFilter('PENDING')}
                  >
                    Pending ({manifestBookings.filter(b => b.status !== 'CHECKED_IN' && !b.checkInTime).length})
                  </button>
                </div>
              </div>

              {manifestLoading ? (
                <div className="loading-center" style={{ padding: '2rem' }}>
                  <div className="spinner"></div> Loading passenger manifest...
                </div>
              ) : manifestBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                  <p style={{ fontWeight: 600, color: 'var(--text-h)', margin: '0 0 0.25rem' }}>No Passengers Assigned to this Flight/Gate</p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>Bookings linked to Gate {manifestGate.gateNumber} or Flight {manifestGate.currentFlight} will appear here automatically.</p>
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Passenger Name</th>
                        <th>Seat</th>
                        <th>Baggage</th>
                        <th>Check-In Status</th>
                        <th>Check-In Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manifestBookings
                        .filter(b => {
                          const isCheckedIn = b.status === 'CHECKED_IN' || !!b.checkInTime;
                          if (manifestFilter === 'CHECKED_IN') return isCheckedIn;
                          if (manifestFilter === 'PENDING') return !isCheckedIn;
                          return true;
                        })
                        .map((b) => {
                          const isCheckedIn = b.status === 'CHECKED_IN' || !!b.checkInTime;
                          const pName = b.passenger ? `${b.passenger.firstName} ${b.passenger.lastName}` : (b.passengerName || 'Unassigned Passenger');
                          return (
                            <tr key={b.id}>
                              <td>
                                <strong style={{ color: 'var(--text-h)' }}>{pName}</strong>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Ref: <span style={{ fontFamily: 'var(--font-mono)' }}>{b.bookingReference || `BK-${b.id}`}</span>
                                  {b.passenger?.passportNumber ? ` • ${b.passenger.passportNumber}` : ''}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--sky-blue)' }}>
                                  {b.seatNumber || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.85rem' }}>
                                  🧳 {b.baggageCount || 0} Bag{b.baggageCount === 1 ? '' : 's'}
                                </span>
                              </td>
                              <td>
                                {isCheckedIn ? (
                                  <span className="badge-status available" style={{ fontSize: '0.75rem' }}>
                                    <span className="badge-dot"></span>Checked In
                                  </span>
                                ) : (
                                  <span className="badge-status maintenance" style={{ fontSize: '0.75rem' }}>
                                    <span className="badge-dot"></span>Pending Check-In
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {b.checkInTime || '—'}
                              </td>
                              <td>
                                {!isCheckedIn && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                    onClick={() => handleManifestCheckIn(b.id)}
                                  >
                                    ⚡ Staff Check-In
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setManifestGate(null)}>Close Manifest</button>
            </div>
          </div>
        </div>
      )}

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
