import { useState, useEffect, useCallback } from 'react';
import { passengerApi } from '../../api/ApiClient';

const emptyPassenger = { firstName: '', lastName: '', phoneNumber: '', email: '', passportNumber: '' };

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

  // Form / Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [form, setForm]               = useState(emptyPassenger);
  const [formError, setFormError]     = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Inspection Drawer/Modal state
  const [inspectPassenger, setInspectPassenger] = useState(null);
  const [passengerPlanes, setPassengerPlanes]   = useState([]);
  const [passengerAirports, setPassengerAirports] = useState([]);
  const [inspectLoading, setInspectLoading]     = useState(false);

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

  useEffect(() => {
    fetchPassengers();
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

  // Inspect passenger planes & airports
  const handleInspect = async (passenger) => {
    setInspectPassenger(passenger);
    setInspectLoading(true);
    setPassengerPlanes([]);
    setPassengerAirports([]);
    try {
      const [planesRes, airportsRes] = await Promise.allSettled([
        passengerApi.getPlanes(passenger.id),
        passengerApi.getAirports(passenger.id),
      ]);

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

  // Modal helpers
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
          <h1>Manage Passengers</h1>
          <p className="page-subtitle">
            View, search, create, update, and inspect passenger profiles and flight history.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-passenger-btn">
          + Add Passenger
        </button>
      </div>

      {/* ID Lookup Tool */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem', color: 'var(--text-h)' }}>
          🔍 Fast Passenger Lookup by ID (CLI Direct Lookup)
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
              <button className="btn btn-secondary btn-sm" onClick={() => handleInspect(lookupResult)}>
                🔍 Inspect Planes & Airports
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
                  {['ID', 'First Name', 'Last Name', 'Phone Number', 'Email', 'Passport', 'Actions'].map((h) => (
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
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)' }}>{p.firstName}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)' }}>{p.lastName}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{p.phoneNumber || '—'}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{p.email || '—'}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{p.passportNumber || '—'}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleInspect(p)} title="View Planes & Airports">
                          ✈️ History
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

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editingPassenger ? `Edit Passenger #${editingPassenger.id}` : 'Add New Passenger'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {formError && <div className="badge-status cancelled" style={{ padding: '0.5rem', marginBottom: '1rem' }}>⚠️ {formError}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input name="firstName" className="input-control" value={form.firstName} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" className="input-control" value={form.lastName} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phoneNumber" className="input-control" value={form.phoneNumber} onChange={handleFormChange} placeholder="e.g. 555-0192" />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="input-control" value={form.email} onChange={handleFormChange} placeholder="e.g. passenger@airport.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Passport Number</label>
                <input name="passportNumber" className="input-control" value={form.passportNumber} onChange={handleFormChange} placeholder="e.g. PP1029384" />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? '⏳ Saving...' : editingPassenger ? '💾 Save Changes' : '✅ Create Passenger'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={formLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT PLANES & AIRPORTS MODAL */}
      {inspectPassenger && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '640px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                ✈️ Travel History — {inspectPassenger.firstName} {inspectPassenger.lastName}
              </h2>
              <button onClick={() => setInspectPassenger(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {inspectLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Querying domain relationships...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Planes for Passenger */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-h)', fontSize: '0.95rem' }}>
                    🛩️ Planes Flown / Booked ({passengerPlanes.length})
                  </h4>
                  {passengerPlanes.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No plane records associated with this passenger.</p>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                      {passengerPlanes.map((pl) => (
                        <div key={pl.id || pl.ID} style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>{pl.type}</strong> ({pl.airlineName || 'N/A'})</span>
                          <span style={{ color: 'var(--text-muted)' }}>Cap: {pl.numOfPassengers} seats</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Airports Used by Passenger */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-h)', fontSize: '0.95rem' }}>
                    🌐 Airports Visited / Used ({passengerAirports.length})
                  </h4>
                  {passengerAirports.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No airport records associated with this passenger.</p>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                      {passengerAirports.map((ap) => (
                        <div key={ap.id} style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>{ap.name}</strong></span>
                          <span className="badge-status on-time" style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>{ap.airportCode}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectPassenger(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '1rem' }}>
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
