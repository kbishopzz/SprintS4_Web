import { useState, useEffect, useCallback } from 'react';
import { cityApi } from '../../api/ApiClient';

const emptyCity = { name: '', province: '', population: '' };

export default function CitiesAdmin() {
  const [cities, setCities]             = useState([]);
  const [page, setPage]                 = useState(0);
  const [pageSize, setPageSize]         = useState(20);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');

  // Lookup by ID
  const [lookupId, setLookupId]         = useState('');
  const [lookupResult, setLookupResult]   = useState(null);
  const [lookupError, setLookupError]     = useState(null);

  // Modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingCity, setEditingCity]   = useState(null);
  const [form, setForm]                 = useState(emptyCity);
  const [formError, setFormError]       = useState('');
  const [formLoading, setFormLoading]   = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  // Airports in City inspection modal
  const [inspectCity, setInspectCity]       = useState(null);
  const [cityAirports, setCityAirports]     = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(false);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cityApi.getAll(page, pageSize);
      if (res.data && res.data.content) {
        setCities(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || res.data.content.length);
      } else if (Array.isArray(res.data)) {
        setCities(res.data);
        setTotalPages(1);
        setTotalElements(res.data.length);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error('[CitiesAdmin] Fetch error:', err);
      setError('Could not load cities. Please verify backend API.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Lookup by ID
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupError(null);
    setLookupResult(null);
    try {
      const res = await cityApi.getById(lookupId.trim());
      setLookupResult(res.data);
    } catch {
      setLookupError(`City ID #${lookupId} not found.`);
    }
  };

  // Inspect Airports in City
  const handleInspectAirports = async (city) => {
    setInspectCity(city);
    setAirportsLoading(true);
    setCityAirports([]);
    try {
      const res = await cityApi.getAirports(city.id);
      setCityAirports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[CitiesAdmin] Get airports in city error:', err);
    } finally {
      setAirportsLoading(false);
    }
  };

  // Filtering
  const filtered = cities.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      c.name?.toLowerCase().includes(q) ||
      c.province?.toLowerCase().includes(q)
    );
  });

  // Modal helpers
  const openCreate = () => {
    setEditingCity(null);
    setForm(emptyCity);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingCity(c);
    setForm({
      name: c.name || '',
      province: c.province || '',
      population: c.population ? String(c.population) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCity(null);
    setForm(emptyCity);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.province.trim()) {
      setFormError('City Name and Province are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        name: form.name.trim(),
        province: form.province.trim(),
        population: form.population ? Number(form.population) : 0,
      };

      if (editingCity) {
        await cityApi.update(editingCity.id, payload);
      } else {
        await cityApi.create(payload);
      }
      closeModal();
      fetchCities();
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
      await cityApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCities();
    } catch (err) {
      console.error('[CitiesAdmin] Delete error:', err);
      setError('Failed to delete city.');
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
          <h1>Manage Cities</h1>
          <p className="page-subtitle">
            Manage municipal origins, provinces, demographic populations, and linked airport hubs.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-city-btn">
          + Add City
        </button>
      </div>

      {/* ID Lookup Tool */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.75rem', color: 'var(--text-h)' }}>
          🔍 City Lookup by ID (CLI Feature)
        </h3>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="number"
            className="input-control"
            style={{ width: '180px', margin: 0 }}
            placeholder="Enter City ID"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">Find City</button>
        </form>

        {lookupError && (
          <div className="badge-status cancelled" style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem' }}>
            ⚠️ {lookupError}
          </div>
        )}

        {lookupResult && (
          <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>#{lookupResult.id} {lookupResult.name}</strong> ({lookupResult.province})
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Population: {lookupResult.population ? lookupResult.population.toLocaleString() : 'N/A'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleInspectAirports(lookupResult)}>
                🌐 View Airports
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(lookupResult)}>
                ✏️ Edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-control"
          style={{ flex: '1 1 240px', margin: 0 }}
          placeholder="🔍 Search cities by name or province..."
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
        <button className="btn btn-secondary btn-sm" onClick={fetchCities}>
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
            ⏳ Loading cities...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            📭 No cities found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'City Name', 'Province', 'Population', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>#{c.id}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{c.province}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>
                      {c.population ? c.population.toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleInspectAirports(c)}>
                          🌐 Airports
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                          onClick={() => setDeleteTarget(c)}
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editingCity ? `Edit City #${editingCity.id}` : 'Add New City'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {formError && <div className="badge-status cancelled" style={{ padding: '0.5rem', marginBottom: '1rem' }}>⚠️ {formError}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City Name *</label>
                <input name="name" className="input-control" value={form.name} onChange={handleFormChange} placeholder="e.g. Toronto" required />
              </div>

              <div className="form-group">
                <label className="form-label">Province / State *</label>
                <input name="province" className="input-control" value={form.province} onChange={handleFormChange} placeholder="e.g. Ontario" required />
              </div>

              <div className="form-group">
                <label className="form-label">Population</label>
                <input name="population" type="number" className="input-control" value={form.population} onChange={handleFormChange} placeholder="e.g. 3000000" />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? '⏳ Saving...' : editingCity ? '💾 Save Changes' : '✅ Create City'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={formLoading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT AIRPORTS IN CITY MODAL */}
      {inspectCity && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                🌐 Airports in {inspectCity.name} ({inspectCity.province})
              </h2>
              <button onClick={() => setInspectCity(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {airportsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading airports in city...</div>
            ) : cityAirports.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No airports registered in this city.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cityAirports.map((a) => (
                  <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{a.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Airport ID #{a.id}</div>
                    </div>
                    <span className="badge-status on-time" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}>
                      {a.airportCode}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectCity(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>Delete City</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{deleteTarget.name} ({deleteTarget.province})</strong>?
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
