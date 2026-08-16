import { useState, useEffect, useCallback } from 'react';
import { passengerApi, airportApi, planeApi, airlineApi, bookingApi } from '../../api/ApiClient';

const emptyPassenger = { firstName: '', lastName: '', phoneNumber: '', email: '', passportNumber: '' };

const emptyBookingForm = {
  passengerId: '',
  flightNumber: '',
  airlineId: '',
  planeId: '',
  originAirportId: '',
  destinationAirportId: '',
  gateId: '',
  departureTime: '',
  arrivalTime: '',
  seatNumber: '',
  baggageCount: 0,
  status: 'BOOKED',
};

export default function PassengersAdmin() {
  const [passengers, setPassengers]   = useState([]);
  const [page, setPage]               = useState(0);
  const [pageSize, setPageSize]       = useState(20);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');

  // Lookup by ID
  const [lookupId, setLookupId]       = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError]   = useState(null);

  // Reference data for dropdowns
  const [airports, setAirports]       = useState([]);
  const [planes, setPlanes]           = useState([]);
  const [airlines, setAirlines]       = useState([]);
  const [availableGates, setAvailableGates] = useState([]);

  // Passenger Create / Edit Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [form, setForm]               = useState(emptyPassenger);
  const [formError, setFormError]     = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete Passenger state
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Inspection Drawer & Bookings state
  const [inspectPassenger, setInspectPassenger] = useState(null);
  const [passengerBookings, setPassengerBookings] = useState([]);
  const [passengerPlanes, setPassengerPlanes]   = useState([]);
  const [passengerAirports, setPassengerAirports] = useState([]);
  const [inspectLoading, setInspectLoading]     = useState(false);

  // Staff Flight Booking Modal state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookForm, setBookForm]           = useState(emptyBookingForm);
  const [bookError, setBookError]         = useState('');
  const [bookLoading, setBookLoading]     = useState(false);

  // Edit Existing Booking Modal state (Baggage / Gate / Check-In Management)
  const [editBooking, setEditBooking]     = useState(null);
  const [editBookingForm, setEditBookingForm] = useState(null);
  const [editBookingGates, setEditBookingGates] = useState([]);
  const [editBookingError, setEditBookingError] = useState('');
  const [editBookingLoading, setEditBookingLoading] = useState(false);

  // Fetch paginated passengers
  const fetchPassengers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await passengerApi.getAll(page, pageSize);
      if (res.data && res.data.content) {
        setPassengers(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || res.data.content.length);
      } else if (Array.isArray(res.data)) {
        setPassengers(res.data);
        setTotalPages(1);
        setTotalElements(res.data.length);
      } else {
        setPassengers([]);
      }
    } catch (err) {
      console.error('[PassengersAdmin] Fetch error:', err);
      setError('Could not load passengers. Please verify backend API.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Fetch reference dropdown options (airports, planes, airlines)
  useEffect(() => {
    fetchPassengers();
    async function loadReferenceData() {
      try {
        const [apRes, plRes, alRes] = await Promise.allSettled([
          airportApi.getAll(),
          planeApi.getAll(),
          airlineApi.getAll(),
        ]);
        if (apRes.status === 'fulfilled' && Array.isArray(apRes.value.data)) setAirports(apRes.value.data);
        if (plRes.status === 'fulfilled' && Array.isArray(plRes.value.data)) setPlanes(plRes.value.data);
        if (alRes.status === 'fulfilled' && Array.isArray(alRes.value.data)) setAirlines(alRes.value.data);
      } catch (err) {
        console.error('[PassengersAdmin] Error loading reference data:', err);
      }
    }
    loadReferenceData();
  }, [fetchPassengers]);

  // Lookup passenger by ID
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await passengerApi.getById(lookupId.trim());
      setLookupResult(res.data);
    } catch {
      setLookupError(`Passenger ID #${lookupId} not found.`);
    }
  };

  // Inspect passenger bookings, planes & airports
  const handleInspect = async (passenger) => {
    setInspectPassenger(passenger);
    setInspectLoading(true);
    setPassengerBookings([]);
    setPassengerPlanes([]);
    setPassengerAirports([]);
    try {
      const [bookingsRes, planesRes, airportsRes] = await Promise.allSettled([
        bookingApi.getByPassenger(passenger.id),
        passengerApi.getPlanes(passenger.id),
        passengerApi.getAirports(passenger.id),
      ]);

      if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data)) {
        setPassengerBookings(bookingsRes.value.data);
      }
      if (planesRes.status === 'fulfilled' && Array.isArray(planesRes.value.data)) {
        setPassengerPlanes(planesRes.value.data);
      }
      if (airportsRes.status === 'fulfilled' && Array.isArray(airportsRes.value.data)) {
        setPassengerAirports(airportsRes.value.data);
      }
    } catch (err) {
      console.error('[PassengersAdmin] Inspect error:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  // Dynamically load gates when origin airport changes in Booking Form
  const handleOriginAirportChange = async (airportId) => {
    setBookForm((prev) => ({ ...prev, originAirportId: airportId, gateId: '' }));
    setAvailableGates([]);
    if (!airportId) return;
    try {
      const res = await airportApi.getGates(airportId);
      if (Array.isArray(res.data)) {
        setAvailableGates(res.data);
      }
    } catch (err) {
      console.error('[PassengersAdmin] Error fetching gates for airport:', err);
    }
  };

  // Open Book Flight Modal
  const openBookModal = (passenger) => {
    const defaultOrigin = airports[0]?.id ? String(airports[0].id) : '';
    const defaultDest   = airports[1]?.id ? String(airports[1].id) : '';

    setBookForm({
      ...emptyBookingForm,
      passengerId: passenger ? String(passenger.id) : '',
      originAirportId: defaultOrigin,
      destinationAirportId: defaultDest,
      flightNumber: 'AC' + (100 + Math.floor(Math.random() * 800)),
      departureTime: new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 09:00',
      arrivalTime:   new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 13:30',
      seatNumber: '14' + String.fromCharCode(65 + Math.floor(Math.random() * 6)),
      baggageCount: 1,
    });
    setBookError('');
    setBookModalOpen(true);

    if (defaultOrigin) {
      handleOriginAirportChange(defaultOrigin);
    }
  };

  const closeBookModal = () => {
    setBookModalOpen(false);
    setBookForm(emptyBookingForm);
    setBookError('');
    setAvailableGates([]);
  };

  // Submit Flight Booking
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.passengerId || !bookForm.flightNumber || !bookForm.originAirportId || !bookForm.destinationAirportId) {
      setBookError('Passenger, Flight Number, Origin Airport, and Destination Airport are required.');
      return;
    }
    setBookLoading(true);
    setBookError('');

    try {
      const payload = {
        flightNumber: bookForm.flightNumber.toUpperCase(),
        passenger: { id: Number(bookForm.passengerId) },
        originAirport: { id: Number(bookForm.originAirportId) },
        destinationAirport: { id: Number(bookForm.destinationAirportId) },
        ...(bookForm.airlineId ? { airline: { id: Number(bookForm.airlineId) } } : {}),
        ...(bookForm.planeId ? { plane: { id: Number(bookForm.planeId) } } : {}),
        ...(bookForm.gateId ? { gate: { id: Number(bookForm.gateId) } } : {}),
        departureTime: bookForm.departureTime,
        arrivalTime: bookForm.arrivalTime,
        seatNumber: bookForm.seatNumber.toUpperCase(),
        baggageCount: Number(bookForm.baggageCount || 0),
        status: bookForm.status,
      };

      await bookingApi.create(payload);
      closeBookModal();
      if (inspectPassenger) {
        handleInspect(inspectPassenger);
      }
      fetchPassengers();
    } catch (err) {
      setBookError(err?.response?.data?.message || err?.message || 'Booking failed.');
    } finally {
      setBookLoading(false);
    }
  };

  // Perform Staff Assisted Check-In on behalf of passenger
  const handleStaffCheckIn = async (bookingId) => {
    try {
      await bookingApi.checkIn(bookingId);
      if (inspectPassenger) {
        handleInspect(inspectPassenger);
      }
    } catch (err) {
      console.error('[PassengersAdmin] Staff check-in error:', err);
    }
  };

  // Open Edit Booking Modal (Baggage / Gate / Seat / Status)
  const openEditBooking = async (b) => {
    setEditBooking(b);
    const originId = b.originAirport?.id || '';
    setEditBookingForm({
      flightNumber: b.flightNumber || '',
      gateId: b.gate?.id ? String(b.gate.id) : '',
      seatNumber: b.seatNumber || '',
      baggageCount: b.baggageCount || 0,
      status: b.status || 'BOOKED',
      departureTime: b.departureTime || '',
      arrivalTime: b.arrivalTime || '',
    });
    setEditBookingError('');

    if (originId) {
      try {
        const res = await airportApi.getGates(originId);
        if (Array.isArray(res.data)) setEditBookingGates(res.data);
      } catch (err) {
        console.error('[PassengersAdmin] Error loading gates for edit booking:', err);
      }
    }
  };

  const handleEditBookingSubmit = async (e) => {
    e.preventDefault();
    if (!editBooking) return;
    setEditBookingLoading(true);
    setEditBookingError('');

    try {
      const payload = {
        flightNumber: editBookingForm.flightNumber,
        seatNumber: editBookingForm.seatNumber,
        baggageCount: Number(editBookingForm.baggageCount),
        status: editBookingForm.status,
        departureTime: editBookingForm.departureTime,
        arrivalTime: editBookingForm.arrivalTime,
        ...(editBookingForm.gateId ? { gate: { id: Number(editBookingForm.gateId) } } : {}),
      };

      await bookingApi.update(editBooking.id, payload);
      setEditBooking(null);
      setEditBookingForm(null);
      if (inspectPassenger) {
        handleInspect(inspectPassenger);
      }
    } catch (err) {
      setEditBookingError(err?.response?.data?.message || err?.message || 'Update failed.');
    } finally {
      setEditBookingLoading(false);
    }
  };

  // Filtering
  const filtered = passengers.filter((p) => {
    const q = search.toLowerCase();
    return (
      !search ||
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q)
    );
  });

  // Modal helpers for Passenger Create/Edit
  const openCreate = () => {
    setEditingPassenger(null);
    setForm(emptyPassenger);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingPassenger(p);
    setForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      phoneNumber: p.phoneNumber || '',
      email: p.email || '',
      passportNumber: p.passportNumber || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPassenger(null);
    setForm(emptyPassenger);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('First and Last name are required.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      if (editingPassenger) {
        await passengerApi.update(editingPassenger.id, form);
      } else {
        await passengerApi.create(form);
      }
      closeModal();
      fetchPassengers();
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await passengerApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchPassengers();
    } catch (err) {
      console.error('[PassengersAdmin] Delete error:', err);
      setError('Failed to delete passenger.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Manage Passengers &amp; Operations</h1>
          <p className="page-subtitle">
            Book flights, assign terminal gates, manage checked baggage, and execute staff-assisted check-ins.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-passenger-btn">
          + Add Passenger
        </button>
      </div>

      {/* Fast Lookup Card */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem', color: 'var(--text-h)' }}>
          🔍 Fast Passenger Lookup &amp; Quick Actions
        </h3>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="number"
            className="input-control"
            style={{ width: '180px', margin: 0 }}
            placeholder="Enter Passenger ID"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">Find Passenger</button>
        </form>

        {lookupError && (
          <div className="badge-status cancelled" style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem' }}>
            ⚠️ {lookupError}
          </div>
        )}

        {lookupResult && (
          <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>#{lookupResult.id} {lookupResult.firstName} {lookupResult.lastName}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Phone: {lookupResult.phoneNumber || 'N/A'} | Email: {lookupResult.email || 'N/A'} | Passport: {lookupResult.passportNumber || 'N/A'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => openBookModal(lookupResult)}>
                🎟️ Book Flight
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleInspect(lookupResult)}>
                🔍 History &amp; Check-In
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(lookupResult)}>
                ✏️ Edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-control"
          style={{ flex: '1 1 240px', margin: 0 }}
          placeholder="🔍 Filter by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Page Size:</span>
          <select
            className="input-control"
            style={{ width: '80px', margin: 0, padding: '0.35rem 0.6rem' }}
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchPassengers}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="badge-status cancelled" style={{ padding: '0.75rem', justifyContent: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Data Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Loading passengers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            📭 No passengers found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Passenger Name', 'Phone Number', 'Email', 'Passport', 'Actions & Operations'].map((h) => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>#{p.id}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)', fontWeight: 600 }}>
                      {p.firstName} {p.lastName}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{p.phoneNumber || '—'}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{p.email || '—'}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{p.passportNumber || '—'}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => openBookModal(p)} title="Book passenger onto a flight">
                          🎟️ Book Flight
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleInspect(p)} title="Inspect bookings & assisted check-in">
                          ✈️ Operations
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                          onClick={() => setDeleteTarget(p)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>Total items: {totalElements}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              ◀ Prev
            </button>
            <span>Page {page + 1} of {totalPages || 1}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* STAFF FLIGHT BOOKING MODAL */}
      {bookModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => { if (e.target === e.currentTarget) closeBookModal(); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '560px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                🎟️ Book Passenger onto Flight
              </h2>
              <button onClick={closeBookModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {bookError && <div className="badge-status cancelled" style={{ padding: '0.5rem', marginBottom: '1rem' }}>⚠️ {bookError}</div>}

            <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Passenger *</label>
                <select
                  className="input-control"
                  value={bookForm.passengerId}
                  onChange={(e) => setBookForm({ ...bookForm, passengerId: e.target.value })}
                  required
                >
                  <option value="">-- Select Passenger --</option>
                  {passengers.map((p) => (
                    <option key={p.id} value={p.id}>#{p.id} - {p.firstName} {p.lastName} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Flight Number *</label>
                  <input
                    className="input-control"
                    value={bookForm.flightNumber}
                    onChange={(e) => setBookForm({ ...bookForm, flightNumber: e.target.value })}
                    placeholder="e.g. AC108"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Airline</label>
                  <select
                    className="input-control"
                    value={bookForm.airlineId}
                    onChange={(e) => setBookForm({ ...bookForm, airlineId: e.target.value })}
                  >
                    <option value="">-- Select Airline --</option>
                    {airlines.map((al) => (
                      <option key={al.id} value={al.id}>{al.name} ({al.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Origin Airport *</label>
                  <select
                    className="input-control"
                    value={bookForm.originAirportId}
                    onChange={(e) => handleOriginAirportChange(e.target.value)}
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
                    value={bookForm.destinationAirportId}
                    onChange={(e) => setBookForm({ ...bookForm, destinationAirportId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Destination --</option>
                    {airports.map((ap) => (
                      <option key={ap.id} value={ap.id}>{ap.name} ({ap.airportCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Assign Terminal Gate</label>
                  <select
                    className="input-control"
                    value={bookForm.gateId}
                    onChange={(e) => setBookForm({ ...bookForm, gateId: e.target.value })}
                  >
                    <option value="">-- Select Gate --</option>
                    {availableGates.map((g) => (
                      <option key={g.id} value={g.id}>Gate {g.gateNumber || g.gateCode} ({g.terminal || 'Main'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Aircraft / Plane</label>
                  <select
                    className="input-control"
                    value={bookForm.planeId}
                    onChange={(e) => setBookForm({ ...bookForm, planeId: e.target.value })}
                  >
                    <option value="">-- Select Aircraft --</option>
                    {planes.map((pl) => (
                      <option key={pl.id || pl.ID} value={pl.id || pl.ID}>{pl.type} ({pl.airlineName || 'N/A'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Departure Time</label>
                  <input
                    className="input-control"
                    value={bookForm.departureTime}
                    onChange={(e) => setBookForm({ ...bookForm, departureTime: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Arrival Time</label>
                  <input
                    className="input-control"
                    value={bookForm.arrivalTime}
                    onChange={(e) => setBookForm({ ...bookForm, arrivalTime: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Seat Number</label>
                  <input
                    className="input-control"
                    value={bookForm.seatNumber}
                    onChange={(e) => setBookForm({ ...bookForm, seatNumber: e.target.value })}
                    placeholder="e.g. 14A"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Checked Bags</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="input-control"
                    value={bookForm.baggageCount}
                    onChange={(e) => setBookForm({ ...bookForm, baggageCount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-In Status</label>
                  <select
                    className="input-control"
                    value={bookForm.status}
                    onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                  >
                    <option value="BOOKED">BOOKED</option>
                    <option value="CHECKED_IN">CHECKED_IN (Assisted)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={bookLoading}>
                  {bookLoading ? '⏳ Processing...' : '🎟️ Confirm Flight Booking'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeBookModal} disabled={bookLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT OPERATIONS & ASSISTED CHECK-IN DRAWER */}
      {inspectPassenger && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '780px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                  ✈️ Flight Operations &amp; Check-In Control
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Passenger: <strong>{inspectPassenger.firstName} {inspectPassenger.lastName}</strong> (ID #{inspectPassenger.id})
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={() => openBookModal(inspectPassenger)}>
                  + Book New Flight
                </button>
                <button onClick={() => setInspectPassenger(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>
            </div>

            {inspectLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading passenger flight operations...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Bookings & Assisted Check-in Table */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', color: 'var(--text-h)', fontSize: '0.95rem' }}>
                    🎟️ Passenger Flight Bookings &amp; Staff Check-In ({passengerBookings.length})
                  </h4>

                  {passengerBookings.length === 0 ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>No active bookings for this passenger.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => openBookModal(inspectPassenger)}>
                        Book First Flight
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {passengerBookings.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            padding: '1rem 1.25rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-h)' }}>
                                {b.flightNumber}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Ref: <strong>{b.bookingReference}</strong>
                              </span>
                            </div>
                            <span className={`badge-status ${b.status?.toLowerCase() === 'checked_in' ? 'on-time' : b.status?.toLowerCase() === 'completed' ? 'landed' : b.status?.toLowerCase() === 'cancelled' ? 'cancelled' : 'delayed'}`}>
                              {b.status}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <div>Route: <strong>{b.originAirport?.airportCode} ➔ {b.destinationAirport?.airportCode}</strong></div>
                            <div>Gate: <strong>{b.gate?.gateNumber || b.gate?.gateCode || 'Unassigned'}</strong></div>
                            <div>Seat: <strong>{b.seatNumber || 'Unassigned'}</strong></div>
                            <div>Baggage: <strong>🎒 {b.baggageCount} bags</strong></div>
                            <div>Departure: <strong>{b.departureTime}</strong></div>
                            <div>Check-In Time: <strong>{b.checkInTime || 'Not checked in'}</strong></div>
                          </div>

                          {/* Operations Action Bar */}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', justifyContent: 'flex-end' }}>
                            {b.status !== 'CHECKED_IN' && b.status !== 'COMPLETED' && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleStaffCheckIn(b.id)} title="Staff Check-In on behalf of passenger">
                                ⚡ Staff Check-In
                              </button>
                            )}
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditBooking(b)}>
                              ✏️ Manage Gate / Baggage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Planes & Airports History */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.5rem', color: 'var(--text-h)' }}>🛩️ Aircraft History ({passengerPlanes.length})</h5>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {passengerPlanes.map((pl) => (
                        <div key={pl.id || pl.ID} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                          {pl.type} ({pl.airlineName || 'N/A'})
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 0.5rem', color: 'var(--text-h)' }}>🌐 Airports Visited ({passengerAirports.length})</h5>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {passengerAirports.map((ap) => (
                        <div key={ap.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                          {ap.name} ({ap.airportCode})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectPassenger(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE BOOKING / BAGGAGE / GATE MODAL */}
      {editBooking && editBookingForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                ✏️ Manage Booking #{editBooking.id} ({editBooking.flightNumber})
              </h2>
              <button onClick={() => { setEditBooking(null); setEditBookingForm(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {editBookingError && <div className="badge-status cancelled" style={{ padding: '0.5rem', marginBottom: '1rem' }}>⚠️ {editBookingError}</div>}

            <form onSubmit={handleEditBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Booking Status</label>
                <select
                  className="input-control"
                  value={editBookingForm.status}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, status: e.target.value })}
                >
                  <option value="BOOKED">BOOKED</option>
                  <option value="CHECKED_IN">CHECKED_IN</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Terminal Gate</label>
                <select
                  className="input-control"
                  value={editBookingForm.gateId}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, gateId: e.target.value })}
                >
                  <option value="">-- Select Gate --</option>
                  {editBookingGates.map((g) => (
                    <option key={g.id} value={g.id}>Gate {g.gateNumber || g.gateCode} ({g.terminal || 'Main'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Seat Number</label>
                  <input
                    className="input-control"
                    value={editBookingForm.seatNumber}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, seatNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Checked Bags</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="input-control"
                    value={editBookingForm.baggageCount}
                    onChange={(e) => setEditBookingForm({ ...editBookingForm, baggageCount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={editBookingLoading}>
                  {editBookingLoading ? '⏳ Saving...' : '💾 Save Booking Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditBooking(null); setEditBookingForm(null); }} disabled={editBookingLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSENGER CREATE / EDIT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1004, padding: '1rem' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editingPassenger ? '✏️ Edit Passenger Details' : '👤 Add New Passenger'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {formError && <div className="badge-status cancelled" style={{ padding: '0.5rem', marginBottom: '1rem' }}>⚠️ {formError}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    className="input-control"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    placeholder="e.g. Keith"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    className="input-control"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    placeholder="e.g. Pye"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-control"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="e.g. keith.pye@example.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="input-control"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="e.g. 709-555-0100"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passport Number</label>
                  <input
                    className="input-control"
                    name="passportNumber"
                    value={form.passportNumber}
                    onChange={handleFormChange}
                    placeholder="e.g. CAN987654"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? '⏳ Saving...' : (editingPassenger ? '💾 Save Changes' : '👤 Create Passenger')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={formLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PASSENGER CONFIRM MODAL */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1003, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>Delete Passenger</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }} onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? '⏳ Deleting...' : '🗑 Confirm Delete'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
