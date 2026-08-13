import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/ApiClient';

/** Role badge colour class mapping */
const roleBadgeClass = (role) =>
  role === 'ADMIN' ? 'badge-status on-time' : 'badge-status scheduled';

/** Empty form state */
const emptyForm = { username: '', email: '', passwordHash: '', role: 'ADMIN' };

export default function UsersAdmin() {
  const { user: currentUser } = useAuth();

  // ── State ───────────────────────────────────────────────────────────────────
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(null);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal / form state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create mode
  const [form, setForm]             = useState(emptyForm);
  const [formError, setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await userApi.getAll();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[UsersAdmin] fetch error:', err);
      setApiError('Could not load users from the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === 'ALL' || (u.role || 'ADMIN') === roleFilter;
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({
      username:     u.username     || '',
      email:        u.email        || '',
      passwordHash: '',           // blank = keep existing
      role:         u.role        || 'ADMIN',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
  };

  // ── Form field handler ───────────────────────────────────────────────────────
  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit create / update ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.username.trim()) { setFormError('Username is required.'); return; }
    if (!editingUser && !form.passwordHash.trim()) { setFormError('Password is required for new accounts.'); return; }
    if (!form.email.trim())    { setFormError('Email is required.'); return; }

    setFormLoading(true);
    try {
      if (editingUser) {
        // Update — only send passwordHash if the admin typed something
        const payload = {
          username:     form.username.trim(),
          email:        form.email.trim(),
          role:         form.role,
          ...(form.passwordHash.trim() ? { passwordHash: form.passwordHash.trim() } : {}),
        };
        await userApi.update(editingUser.id, payload);
      } else {
        await userApi.create({
          username:     form.username.trim(),
          email:        form.email.trim(),
          passwordHash: form.passwordHash.trim(),
          role:         form.role,
        });
      }
      closeModal();
      await fetchUsers();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.statusText || err?.message || 'Operation failed.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const confirmDelete = (u) => setDeleteTarget(u);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await userApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      console.error('[UsersAdmin] delete error:', err);
      setApiError('Failed to delete user. Please try again.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>User Management</h1>
          <p className="page-subtitle">
            Manage system admin and user accounts — create, edit, and delete access profiles.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-user-btn">
          + New Account
        </button>
      </div>

      {/* ── Active Admin Profile Card ─────────────────────────────────────────── */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.75rem' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--sky-blue), var(--sky-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>
          👤
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-h)' }}>
            {currentUser?.username || 'Admin'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {currentUser?.email || '—'} &nbsp;·&nbsp;
            Active Session
            {currentUser?.provider === 'keycloak' && (
              <span style={{ marginLeft: '0.5rem' }}>🔐 via Keycloak</span>
            )}
          </div>
        </div>
        <span className={roleBadgeClass(currentUser?.role || 'ADMIN')} style={{ padding: '0.3rem 0.8rem' }}>
          {currentUser?.role || 'ADMIN'}
        </span>
      </div>

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-control"
          style={{ flex: '1 1 220px', margin: 0 }}
          placeholder="🔍 Search by username or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="user-search-input"
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'ADMIN', 'USER'].map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRoleFilter(r)}
              id={`filter-${r.toLowerCase()}`}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchUsers} title="Refresh list">
          ↻ Refresh
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────────── */}
      {apiError && (
        <div className="badge-status cancelled" style={{ padding: '0.75rem 1rem', width: '100%', justifyContent: 'center' }}>
          ⚠️ {apiError}
        </div>
      )}

      {/* ── Users Table ──────────────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Loading accounts…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {users.length === 0
              ? '📭 No accounts found. Create the first one above.'
              : '🔍 No accounts match your search or filter.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Username', 'Email', 'Role', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '0.85rem 1.25rem', textAlign: 'left',
                      fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--text-muted)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: 'var(--text-h)' }}>
                      {u.username}
                      {currentUser?.username === u.username && (
                        <span className="badge-status on-time" style={{ marginLeft: '0.5rem', padding: '0.1rem 0.5rem', fontSize: '0.68rem' }}>
                          You
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {u.email || '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <span className={roleBadgeClass(u.role || 'ADMIN')} style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem' }}>
                        {u.role || 'ADMIN'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(u)}
                          id={`edit-user-${u.id}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                          onClick={() => confirmDelete(u)}
                          id={`delete-user-${u.id}`}
                          disabled={currentUser?.username === u.username}
                          title={currentUser?.username === u.username ? 'Cannot delete your own account' : 'Delete account'}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {!loading && users.length > 0 && (
          <div style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {users.length} account{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          CREATE / EDIT MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          id="user-modal-overlay"
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '460px', padding: '2rem', position: 'relative' }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-h)' }}>
                {editingUser ? `Edit Account — ${editingUser.username}` : 'Create New Account'}
              </h2>
              <button
                className="btn-icon"
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                id="close-modal-btn"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="badge-status cancelled" style={{ padding: '0.5rem 1rem', marginBottom: '1rem', width: '100%', justifyContent: 'center' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="modal-username" className="form-label">Username *</label>
                <input
                  id="modal-username"
                  name="username"
                  type="text"
                  className="input-control"
                  value={form.username}
                  onChange={handleField}
                  placeholder="e.g. JSmith"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-email" className="form-label">Email *</label>
                <input
                  id="modal-email"
                  name="email"
                  type="email"
                  className="input-control"
                  value={form.email}
                  onChange={handleField}
                  placeholder="e.g. jsmith@airport.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-password" className="form-label">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  id="modal-password"
                  name="passwordHash"
                  type="password"
                  className="input-control"
                  value={form.passwordHash}
                  onChange={handleField}
                  placeholder={editingUser ? '••••••••  (unchanged)' : '••••••••'}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-role" className="form-label">Role *</label>
                <select
                  id="modal-role"
                  name="role"
                  className="input-control"
                  value={form.role}
                  onChange={handleField}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="ADMIN">ADMIN — Full Portal Access</option>
                  <option value="USER">USER — Standard Access</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={formLoading}
                  id="submit-user-btn"
                >
                  {formLoading ? '⏳ Saving…' : editingUser ? '💾 Save Changes' : '✅ Create Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          DELETE CONFIRMATION MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1001, padding: '1rem',
          }}
          id="delete-confirm-overlay"
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-h)' }}>
              Delete Account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: 'var(--text-h)' }}>{deleteTarget.username}</strong>?
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', minWidth: '110px' }}
                onClick={handleDelete}
                disabled={deleteLoading}
                id="confirm-delete-btn"
              >
                {deleteLoading ? '⏳ Deleting…' : '🗑 Yes, Delete'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                id="cancel-delete-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
