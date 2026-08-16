import { useState, useEffect, useCallback } from 'react';
import { bookingApi, airlineApi, airportApi, gateApi, planeApi, passengerApi } from '../../api/ApiClient';

const emptyFlight = {
  flightNumber: '',
  passengerId: '',
  airlineId: '',
  originAirportId: '',
  destinationAirportId: '',
  gateId: '',
  planeId: '',
  departureTime: '',
  arrivalTime: '',
  seatNumber: '14A',
  baggageCount: 1,
  status: 'ON TIME',
};

export default function FlightsAdmin() {
  const [flights, setFlights]         = useState([]);
  const [airlines, setAirlines]       = useState([]);
  const [airports, setAirports]       = useState([]);
  const [gates, setGates]             = useState([]);
  const [planes, setPlanes]           = useState([]);
  const [passengers, setPassengers]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingFlight, setEditingFlight] = useState(null); // null = Create Mode
  const [form, setForm]                 = useState(emptyFlight);
  const [formError, setFormError]       = useState('');
  const [formLoading, setFormLoading]   = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch Reference Data & Flights ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, alRes, apRes, gRes, plRes, psRes] = await Promise.allSettled([
        bookingApi.getAll(),
        airlineApi.getAll(),
        airportApi.getAll(),
        gateApi.getAll(),
        planeApi.getAll(),
        passengerApi.getAll(0, 100),
      ]);

      if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data)) {
        setFlights(bookingsRes.value.data);
      } else {
        setFlights([]);
      }

      if (alRes.status === 'fulfilled' && Array.isArray(alRes.value.data)) setAirlines(alRes.value.data);
      if (apRes.status === 'fulfilled' && Array.isArray(apRes.value.data)) setAirports(apRes.value.data);
      if (gRes.status === 'fulfilled' && Array.isArray(gRes.value.data)) setGates(gRes.value.data);
      if (plRes.status === 'fulfilled' && Array.isArray(plRes.value.data)) setPlanes(plRes.value.data);
      if (psRes.status === 'fulfilled') {
        const d = psRes.value.data;
        setPassengers(d.content || (Array.isArray(d) ? d : []));
      }
    } catch (err) {
      console.error('[FlightsAdmin] Fetch error:', err);
      setError('Could not load flights data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingFlight(null);
    const defaultOrigin = airports[0]?.id ? String(airports[0].id) : '';
    const defaultDest   = airports[1]?.id ? String(airports[1].id) : (airports[0]?.id ? String(airports[0].id) : '');
    const defaultPassenger = passengers[0]?.id ? String(passengers[0].id) : '';
    const defaultAirline   = airlines[0]?.id ? String(airlines[0].id) : '';

    setForm({
      ...emptyFlight,
      flightNumber: 'AC' + (100 + Math.floor(Math.random() * 800)),
      passengerId: defaultPassenger,
      airlineId: defaultAirline,
      originAirportId: defaultOrigin,
      destinationAirportId: defaultDest,
      departureTime: new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 08:30',
      arrivalTime: new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 11:45',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (flight) => {
    setEditingFlight(flight);
    setForm({
      flightNumber: flight.flightNumber || '',
      passengerId: flight.passenger?.id ? String(flight.passenger.id) : (passengers[0]?.id ? String(passengers[0].id) : ''),
      airlineId: flight.airline?.id ? String(flight.airline.id) : '',
      originAirportId: flight.originAirport?.id ? String(flight.originAirport.id) : '',
      destinationAirportId: flight.destinationAirport?.id ? String(flight.destinationAirport.id) : '',
      gateId: flight.gate?.id ? String(flight.gate.id) : '',
      planeId: flight.plane?.id ? String(flight.plane.id) : '',
      departureTime: flight.departureTime || '',
      arrivalTime: flight.arrivalTime || '',
      seatNumber: flight.seatNumber || '14A',
      baggageCount: flight.baggageCount ?? 1,
      status: flight.status || 'ON TIME',
    });
    setFormError('');
    setModalOpen(true);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flightNumber.trim()) {
      setFormError('Flight number is required.');
      return;
    }
    if (!form.originAirportId || !form.destinationAirportId) {
      setFormError('Origin and Destination airports are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    const payload = {
      flightNumber: form.flightNumber.trim(),
      bookingReference: editingFlight?.bookingReference || ('BK-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      seatNumber: form.seatNumber,
      baggageCount: Number(form.baggageCount) || 1,
      status: form.status,
      ...(form.passengerId ? { passenger: { id: Number(form.passengerId) } } : {}),
      ...(form.airlineId ? { airline: { id: Number(form.airlineId) } } : {}),
      ...(form.originAirportId ? { originAirport: { id: Number(form.originAirportId) } } : {}),
      ...(form.destinationAirportId ? { destinationAirport: { id: Number(form.destinationAirportId) } } : {}),
      ...(form.gateId ? { gate: { id: Number(form.gateId) } } : {}),
      ...(form.planeId ? { plane: { id: Number(form.planeId) } } : {}),
    };

    try {
      if (editingFlight) {
        const res = await bookingApi.update(editingFlight.id, payload);
        setFlights(flights.map(f => f.id === editingFlight.id ? (res.data || { ...f, ...payload }) : f));
      } else {
        const res = await bookingApi.create(payload);
        setFlights([...flights, res.data || { id: Date.now(), ...payload }]);
      }

      if (form.gateId) {
        try {
          await gateApi.update(Number(form.gateId), {
            currentFlight: form.flightNumber.trim(),
            status: form.status === 'AVAILABLE' ? 'OCCUPIED' : form.status,
          });
        } catch (gErr) {
          console.warn('[FlightsAdmin] Could not sync gate entity:', gErr);
        }
      }

      setModalOpen(false);
    } catch (err) {
      console.error('[FlightsAdmin] Save error:', err);
      setFormError('Failed to save flight. Ensure passenger and airport selections are valid.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await bookingApi.delete(deleteTarget.id);
      setFlights(flights.filter(f => f.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[FlightsAdmin] Delete error:', err);
      alert('Failed to delete flight.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCheckIn = async (flight) => {
    try {
      const res = await bookingApi.checkIn(flight.id);
      setFlights(flights.map(f => f.id === flight.id ? (res.data || { ...f, status: 'CHECKED IN' }) : f));
    } catch (err) {
      console.error('[FlightsAdmin] Check-in error:', err);
      // Fallback local state update
      setFlights(flights.map(f => f.id === flight.id ? { ...f, status: 'CHECKED IN' } : f));
    }
  };

  // ── Filter Flights ─────────────────────────────────────────────────────────
  const filteredFlights = flights.filter(f => {
    const flightNo = f.flightNumber || '';
    const airlineName = f.airline?.name || '';
    const origin = f.originAirport?.airportCode || f.originAirport?.name || '';
    const dest = f.destinationAirport?.airportCode || f.destinationAirport?.name || '';

    const matchesSearch = !searchTerm ||
      flightNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airlineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.toLowerCase().includes(searchTerm.toLowerCase());

    const statusStr = (f.status || 'ON TIME').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || statusStr.includes(statusFilter);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Flights</h1>
          <p className="page-subtitle">Configure flight schedules, routes, gates, and operational statuses.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add New Flight
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-icon blue">✈️</div>
          <div className="metric-details">
            <span className="metric-value">{flights.length}</span>
            <span className="metric-label">Total Scheduled Flights</span>
          </div>
        </div>
        <div className="metric-card green">
          <div className="metric-icon green">✅</div>
          <div className="metric-details">
            <span className="metric-value">{flights.filter(f => (f.status || 'ON TIME').includes('TIME') || (f.status || '').includes('CHECKED')).length}</span>
            <span className="metric-label">On Time / Checked In</span>
          </div>
        </div>
        <div className="metric-card yellow">
          <div className="metric-icon yellow">⏳</div>
          <div className="metric-details">
            <span className="metric-value">{flights.filter(f => (f.status || '').includes('DELAY')).length}</span>
            <span className="metric-label">Delayed</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="input-control"
            placeholder="Search flight #, airline, airport..."
            style={{ width: '280px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-right">
          <button className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>All</button>
          <button className={`filter-pill ${statusFilter === 'ON TIME' ? 'active' : ''}`} onClick={() => setStatusFilter('ON TIME')}>On Time</button>
          <button className={`filter-pill ${statusFilter === 'BOARDING' ? 'active' : ''}`} onClick={() => setStatusFilter('BOARDING')}>Boarding</button>
          <button className={`filter-pill ${statusFilter === 'DELAY' ? 'active' : ''}`} onClick={() => setStatusFilter('DELAY')}>Delayed</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {filteredFlights.length} flights</span>
        </div>
      </div>

      {/* Flight Management Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div> Loading Flight Schedules...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Flight # & Airline</th>
                <th>Route (Origin ➔ Dest)</th>
                <th>Terminal Gate</th>
                <th>Departure / Arrival</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((f) => {
                const origin = f.originAirport?.airportCode || f.originAirport?.name || 'YYT';
                const dest   = f.destinationAirport?.airportCode || f.destinationAirport?.name || 'YYZ';
                const gate   = f.gate?.gateNumber || f.gate?.gateCode || 'Unassigned';
                const airlineName = f.airline?.name || 'Partner';
                const status = f.status || 'ON TIME';

                return (
                  <tr key={f.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{f.bookingReference || f.id}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--font-mono)' }}>✈️ {f.flightNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{airlineName}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{origin} ➔ {dest}</td>
                    <td>
                      <span className="user-badge" style={{ fontWeight: 700, background: 'var(--sky-blue-light)', color: 'var(--sky-blue)' }}>
                        Gate {gate}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>{f.departureTime || '09:00 AM'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Arr: {f.arrivalTime || '12:30 PM'}</div>
                    </td>
                    <td>
                      <span className={`badge-status ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                        <span className="badge-dot"></span>{status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleCheckIn(f)}>Check-In</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(f)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(f)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filteredFlights.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">✈️</div>
            <div className="empty-state-title">No flights found</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Flight Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '650px' }}>
            <div className="modal-header blue">
              <h3>{editingFlight ? '✏️ Edit Flight Details' : '✈️ Add New Flight Schedule'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {formError && <div className="alert alert-error">{formError}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Flight Number *</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. AC108"
                      value={form.flightNumber}
                      onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operating Airline</label>
                    <select
                      className="input-control"
                      value={form.airlineId}
                      onChange={(e) => setForm({ ...form, airlineId: e.target.value })}
                    >
                      <option value="">-- Select Airline --</option>
                      {airlines.map((al) => (
                        <option key={al.id} value={al.id}>{al.name} ({al.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Origin Airport *</label>
                    <select
                      className="input-control"
                      value={form.originAirportId}
                      onChange={(e) => setForm({ ...form, originAirportId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Origin --</option>
                      {airports.map((ap) => (
                        <option key={ap.id} value={ap.id}>{ap.name} ({ap.airportCode})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Airport *</label>
                    <select
                      className="input-control"
                      value={form.destinationAirportId}
                      onChange={(e) => setForm({ ...form, destinationAirportId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Destination --</option>
                      {airports.map((ap) => (
                        <option key={ap.id} value={ap.id}>{ap.name} ({ap.airportCode})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Assign Terminal Gate</label>
                    <select
                      className="input-control"
                      value={form.gateId}
                      onChange={(e) => setForm({ ...form, gateId: e.target.value })}
                    >
                      <option value="">-- Select Gate --</option>
                      {gates.map((g) => (
                        <option key={g.id} value={g.id}>
                          Gate {g.gateNumber || g.gateCode} ({g.airport?.airportCode || 'Airport'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Aircraft / Plane</label>
                    <select
                      className="input-control"
                      value={form.planeId}
                      onChange={(e) => setForm({ ...form, planeId: e.target.value })}
                    >
                      <option value="">-- Select Aircraft --</option>
                      {planes.map((pl) => (
                        <option key={pl.id || pl.ID} value={pl.id || pl.ID}>
                          {pl.type} ({pl.airlineName || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Departure Date & Time</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. 2026-08-20 08:30"
                      value={form.departureTime}
                      onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arrival Date & Time</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="e.g. 2026-08-20 11:45"
                      value={form.arrivalTime}
                      onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Passenger Assignment</label>
                    <select
                      className="input-control"
                      value={form.passengerId}
                      onChange={(e) => setForm({ ...form, passengerId: e.target.value })}
                    >
                      <option value="">-- Select Passenger --</option>
                      {passengers.map((p) => (
                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Flight Status</label>
                    <select
                      className="input-control"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="ON TIME">ON TIME</option>
                      <option value="BOARDING">BOARDING</option>
                      <option value="DELAYED">DELAYED</option>
                      <option value="CHECKED IN">CHECKED IN</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editingFlight ? 'Save Changes' : 'Save Flight')}
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
              <h3>🗑️ Delete Flight</h3>
              <button className="btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete flight <strong>{deleteTarget.flightNumber}</strong> (#{deleteTarget.bookingReference || deleteTarget.id})?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete Flight'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
