import { useState, useEffect, useCallback } from 'react';
import { airportApi, cityApi } from '../../api/ApiClient';

const emptyAirport = { name: '', airportCode: '', cityId: '' };

export default function AirportsAdmin() {
  const [airports, setAirports]       = useState([]);
  const [cities, setCities]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');

  // Lookup by ID
  const [lookupId, setLookupId]       = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError]   = useState(null);

  // Form / Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingAirport, setEditingAirport] = useState(null);
  const [form, setForm]               = useState(emptyAirport);
  const [formError, setFormError]     = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Gates inspection state
  const [inspectAirport, setInspectAirport] = useState(null);
  const [airportGates, setAirportGates]     = useState([]);
  const [gatesLoading, setGatesLoading]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [airportsRes, citiesRes] = await Promise.allSettled([
        airportApi.getAll(),
        cityApi.getAll(0, 100),
      ]);

      if (airportsRes.status === 'fulfilled' && Array.isArray(airportsRes.value.data)) {
        setAirports(airportsRes.value.data);
      }
      if (citiesRes.status === 'fulfilled') {
        const cData = citiesRes.value.data;
        setCities(cData.content || (Array.isArray(cData) ? cData : []));
      }
    } catch (err) {
      console.error('[AirportsAdmin] Fetch error:', err);
      setError('Could not load airports data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lookup by ID
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await airportApi.getById(lookupId.trim());
      setLookupResult(res.data);
    } catch {
      setLookupError(`Airport ID #${lookupId} not found.`);
    }
  };

  // Inspect gates
  const handleInspectGates = async (airport) => {
    setInspectAirport(airport);
    setGatesLoading(true);
    setAirportGates([]);
    try {
      const res = await airportApi.getGates(airport.id);
      setAirportGates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[AirportsAdmin] Get gates error:', err);
    } finally {
      setGatesLoading(false);
    }
  };

  // Filtering
  const filtered = airports.filter((a) => {
    const q = search.toLowerCase();
    return (
      !search ||
      a.name?.toLowerCase().includes(q) ||
      a.airportCode?.toLowerCase().includes(q) ||
      a.city?.name?.toLowerCase().includes(q)
    );
  });

  // Modal helpers
  const openCreate = () => {
    setEditingAirport(null);
    setForm(emptyAirport);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditingAirport(a);
    setForm({
      name: a.name || '',
      airportCode: a.airportCode || '',
      cityId: a.city?.id ? String(a.city.id) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAirport(null);
    setForm(emptyAirport);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.airportCode.trim()) {
      setFormError('Airport Name and Airport Code are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        name: form.name.trim(),
        airportCode: form.airportCode.trim().toUpperCase(),
        ...(form.cityId ? { city: { id: Number(form.cityId) } } : {}),
      };

      if (editingAirport) {
        await airportApi.update(editingAirport.id, payload);
      } else {
        await airportApi.create(payload);
      }
      closeModal();
      fetchData();
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
      await airportApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('[AirportsAdmin] Delete error:', err);
      setError('Failed to delete airport.');
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
          <h1>Manage Airports</h1>
          <p className="page-subtitle">
            Configure airport hubs, IATA codes, city associations, and terminal gate layouts.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-airport-btn">
          + Add Airport
        </button>
      </div>

      {/* Lookup Bar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem', color: 'var(--text-h)' }}>
          🔍 Airport Lookup by ID (CLI Feature)
        </h3>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="number"
            className="input-control"
            style={{ width: '180px', margin: 0 }}
            placeholder="Enter Airport ID"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">Find Airport</button>
        </form>

        {lookupError && (
          <div className="badge-status cancelled" style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem' }}>
            ⚠️ {lookupError}
          </div>
        )}

        {lookupResult && (
          <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>#{lookupResult.id} {lookupResult.name}</strong> ({lookupResult.airportCode})
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                City: {lookupResult.city?.name || 'Unassigned'} | Gates: {lookupResult.gates?.length || 0}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleInspectGates(lookupResult)}>
                🚪 View Gates
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(lookupResult)}>
                ✏️ Edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          className="input-control"
          style={{ flex: 1, margin: 0 }}
          placeholder="🔍 Search airports by name, IATA code, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary btn-sm" onClick={fetchData}>
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
            ⏳ Loading airports...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            📭 No airports found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Name', 'IATA Code', 'City', 'Gates', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>#{a.id}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)', fontWeight: 600 }}>{a.name}</td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span className="badge-status on-time" style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>
                        {a.airportCode}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>
                      {a.city?.name ? `🏙️ ${a.city.name} (${a.city.province || ''})` : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>
                      {a.gates ? `${a.gates.length} gates` : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleInspectGates(a)}>
                          🚪 Gates
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                          onClick={() => setDeleteTarget(a)}
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
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editingAirport ? `Edit Airport #${editingAirport.id}` : 'Add New Airport'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {formError && <div className="badge-status cancelled" style={{ padding: '0.5rem', marginBottom: '1rem' }}>⚠️ {formError}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Airport Name *</label>
                <input name="name" className="input-control" value={form.name} onChange={handleFormChange} placeholder="e.g. Vancouver International Airport" required />
              </div>

              <div className="form-group">
                <label className="form-label">IATA Airport Code *</label>
                <input name="airportCode" className="input-control" value={form.airportCode} onChange={handleFormChange} placeholder="e.g. YVR" maxLength={10} required />
              </div>

              <div className="form-group">
                <label className="form-label">Associated City (Optional)</label>
                <select name="cityId" className="input-control" value={form.cityId} onChange={handleFormChange}>
                  <option value="">-- Select City --</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.province})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? '⏳ Saving...' : editingAirport ? '💾 Save Changes' : '✅ Create Airport'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={formLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT GATES MODAL */}
      {inspectAirport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                🚪 Terminal Gates at {inspectAirport.name} ({inspectAirport.airportCode})
              </h2>
              <button onClick={() => setInspectAirport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {gatesLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading gates...</div>
            ) : airportGates.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No gates registered for this airport.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {airportGates.map((g) => (
                  <div key={g.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-h)' }}>
                      {g.gateNumber || g.gateCode}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {g.terminal || 'Main Terminal'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectAirport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>Delete Airport</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{deleteTarget.name} ({deleteTarget.airportCode})</strong>?
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
