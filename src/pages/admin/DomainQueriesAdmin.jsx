import { useState, useEffect } from 'react';
import { cityApi, passengerApi, planeApi, gateApi, bookingApi } from '../../api/ApiClient';

export default function DomainQueriesAdmin() {
  const [activeTab, setActiveTab]   = useState('q1'); // q1, q2, q3, q4, q5

  // Pickers data
  const [cities, setCities]         = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [planes, setPlanes]         = useState([]);
  const [gates, setGates]           = useState([]);

  // Query inputs
  const [selectedCityId, setSelectedCityId]           = useState('');
  const [selectedPassengerId1, setSelectedPassengerId1] = useState('');
  const [selectedPlaneId, setSelectedPlaneId]         = useState('');
  const [selectedPassengerId2, setSelectedPassengerId2] = useState('');
  const [selectedFlightNo, setSelectedFlightNo]       = useState('');
  const [selectedGateId, setSelectedGateId]           = useState('');

  // Results
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // Load selection dropdown data
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [cRes, pRes, plRes, gRes] = await Promise.allSettled([
          cityApi.getAll(0, 100),
          passengerApi.getAll(0, 100),
          planeApi.getAll(),
          gateApi.getAll(),
        ]);

        if (cRes.status === 'fulfilled') {
          const d = cRes.value.data;
          setCities(d.content || (Array.isArray(d) ? d : []));
        }
        if (pRes.status === 'fulfilled') {
          const d = pRes.value.data;
          setPassengers(d.content || (Array.isArray(d) ? d : []));
        }
        if (plRes.status === 'fulfilled' && Array.isArray(plRes.value.data)) {
          setPlanes(plRes.value.data);
        }
        if (gRes.status === 'fulfilled' && Array.isArray(gRes.value.data)) {
          setGates(gRes.value.data);
        }
      } catch (err) {
        console.error('[DomainQueriesAdmin] Error loading dropdown options:', err);
      }
    }
    loadDropdowns();
  }, []);

  // Clear state on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResults(null);
    setError(null);
  };

  // Run Query 1: Airports in a City
  const runQuery1 = async (cityId) => {
    const cid = cityId || selectedCityId;
    if (!cid) { setError('Please select or enter a City ID.'); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await cityApi.getAirports(cid);
      setResults({ type: 'airports', title: `Airports in City #${cid}`, data: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Query execution failed.');
    } finally { setLoading(false); }
  };

  // Run Query 2: Planes for a Passenger
  const runQuery2 = async (passengerId) => {
    const pid = passengerId || selectedPassengerId1;
    if (!pid) { setError('Please select or enter a Passenger ID.'); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await passengerApi.getPlanes(pid);
      setResults({ type: 'planes', title: `Planes taken by Passenger #${pid}`, data: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Query execution failed.');
    } finally { setLoading(false); }
  };

  // Run Query 3: Airports for a Plane
  const runQuery3 = async (planeId) => {
    const plid = planeId || selectedPlaneId;
    if (!plid) { setError('Please select or enter a Plane ID.'); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await planeApi.getAirports(plid);
      setResults({ type: 'airports', title: `Airports served by Aircraft #${plid}`, data: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Query execution failed.');
    } finally { setLoading(false); }
  };

  // Run Query 4: Airports used by a Passenger
  const runQuery4 = async (passengerId) => {
    const pid = passengerId || selectedPassengerId2;
    if (!pid) { setError('Please select or enter a Passenger ID.'); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await passengerApi.getAirports(pid);
      setResults({ type: 'airports', title: `Airports used by Passenger #${pid}`, data: Array.isArray(res.data) ? res.data : [] });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Query execution failed.');
    } finally { setLoading(false); }
  };

  // Run Query 5: Checked-In Passengers on Flight at Gate
  const runQuery5 = async () => {
    if (!selectedFlightNo && !selectedGateId) {
      setError('Please select or type a Flight Number, or select a Gate.');
      return;
    }
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await bookingApi.getManifest(selectedFlightNo, selectedGateId, 'CHECKED_IN');
      const manifest = Array.isArray(res.data) ? res.data : [];
      setResults({
        type: 'manifest',
        title: `Checked-In Passengers ${selectedFlightNo ? `on Flight ${selectedFlightNo}` : ''} ${selectedGateId ? `at Gate #${selectedGateId}` : ''}`,
        data: manifest,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Query execution failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Sprint Domain Queries Hub</h1>
          <p className="page-subtitle">
            Interactive suite for executing complex multi-entity domain relationship queries (CLI Option 5).
          </p>
        </div>
      </div>

      {/* Query Navigation Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'q1', icon: '🏙️', label: 'Airports in City', sub: 'What airports are in each city?' },
          { id: 'q2', icon: '🛩️', label: 'Planes for Passenger', sub: 'What aircraft has a passenger taken?' },
          { id: 'q3', icon: '✈️', label: 'Airports for Plane', sub: 'What airports are served by a plane?' },
          { id: 'q4', icon: '🌐', label: 'Airports for Passenger', sub: 'What airports has a passenger used?' },
          { id: 'q5', icon: '👥', label: 'Checked-In Manifest', sub: 'Passengers on a flight at a certain gate' },
        ].map((t) => (
          <div
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className="glass-card"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              border: activeTab === t.id ? '2px solid var(--sky-blue)' : '1px solid var(--border)',
              background: activeTab === t.id ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{t.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-h)' }}>{t.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* Active Query Input Panel */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {activeTab === 'q1' && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'var(--text-h)' }}>
              1. List Airports in a City
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select a city or type a City ID to retrieve all airports associated with that municipality.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input-control"
                style={{ width: '260px', margin: 0 }}
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
              >
                <option value="">-- Select City --</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>#{c.id} - {c.name} ({c.province})</option>
                ))}
              </select>
              <input
                type="number"
                className="input-control"
                style={{ width: '150px', margin: 0 }}
                placeholder="Or City ID #"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => runQuery1()} disabled={loading}>
                {loading ? '⏳ Running...' : '🚀 Execute Query'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'q2' && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'var(--text-h)' }}>
              2. List Planes for a Passenger
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select a passenger to inspect all aircraft types they have traveled on or booked.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input-control"
                style={{ width: '280px', margin: 0 }}
                value={selectedPassengerId1}
                onChange={(e) => setSelectedPassengerId1(e.target.value)}
              >
                <option value="">-- Select Passenger --</option>
                {passengers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.id} - {p.firstName} {p.lastName}</option>
                ))}
              </select>
              <input
                type="number"
                className="input-control"
                style={{ width: '150px', margin: 0 }}
                placeholder="Or Passenger ID #"
                value={selectedPassengerId1}
                onChange={(e) => setSelectedPassengerId1(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => runQuery2()} disabled={loading}>
                {loading ? '⏳ Running...' : '🚀 Execute Query'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'q3' && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'var(--text-h)' }}>
              3. List Airports for a Plane
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select an aircraft to find all airports on its flight route itinerary.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input-control"
                style={{ width: '280px', margin: 0 }}
                value={selectedPlaneId}
                onChange={(e) => setSelectedPlaneId(e.target.value)}
              >
                <option value="">-- Select Plane --</option>
                {planes.map((pl) => (
                  <option key={pl.id || pl.ID} value={pl.id || pl.ID}>
                    #{pl.id || pl.ID} - {pl.type} ({pl.airlineName || 'N/A'})
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="input-control"
                style={{ width: '150px', margin: 0 }}
                placeholder="Or Plane ID #"
                value={selectedPlaneId}
                onChange={(e) => setSelectedPlaneId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => runQuery3()} disabled={loading}>
                {loading ? '⏳ Running...' : '🚀 Execute Query'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'q4' && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'var(--text-h)' }}>
              4. List Airports used by a Passenger
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select a passenger to get all distinct origin and destination airports they have traveled through.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input-control"
                style={{ width: '280px', margin: 0 }}
                value={selectedPassengerId2}
                onChange={(e) => setSelectedPassengerId2(e.target.value)}
              >
                <option value="">-- Select Passenger --</option>
                {passengers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.id} - {p.firstName} {p.lastName}</option>
                ))}
              </select>
              <input
                type="number"
                className="input-control"
                style={{ width: '150px', margin: 0 }}
                placeholder="Or Passenger ID #"
                value={selectedPassengerId2}
                onChange={(e) => setSelectedPassengerId2(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => runQuery4()} disabled={loading}>
                {loading ? '⏳ Running...' : '🚀 Execute Query'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'q5' && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'var(--text-h)' }}>
              5. View Checked-In Passengers by Flight &amp; Gate
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              View all checked-in passengers for a specific flight number at a designated terminal gate.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input-control"
                style={{ width: '180px', margin: 0 }}
                placeholder="Flight # (e.g. AC101)"
                value={selectedFlightNo}
                onChange={(e) => setSelectedFlightNo(e.target.value)}
              />
              <select
                className="input-control"
                style={{ width: '240px', margin: 0 }}
                value={selectedGateId}
                onChange={(e) => setSelectedGateId(e.target.value)}
              >
                <option value="">-- Any / Select Gate --</option>
                {gates.map((g) => (
                  <option key={g.id} value={g.id}>
                    Gate {g.gateNumber || g.gateCode} ({g.terminal || 'Main'} - {g.currentFlight ? `✈️ ${g.currentFlight}` : 'No flight'})
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={() => runQuery5()} disabled={loading}>
                {loading ? '⏳ Fetching Manifest...' : '👥 View Manifest'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="badge-status cancelled" style={{ padding: '0.75rem 1rem', justifyContent: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-h)' }}>
              📊 {results.title}
            </h3>
            <span className="badge-status on-time" style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>
              {results.data.length} records returned
            </span>
          </div>

          {results.data.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              📭 No checked-in passengers or records found for this query.
            </div>
          ) : results.type === 'manifest' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Passenger Name', 'Passport #', 'Flight', 'Gate', 'Seat', 'Baggage', 'Status', 'Check-In Time'].map((h) => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((b) => {
                    const pName = b.passenger ? `${b.passenger.firstName} ${b.passenger.lastName}` : (b.passengerName || 'Unknown');
                    const isCheckedIn = b.status === 'CHECKED_IN' || !!b.checkInTime;
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)', fontWeight: 600 }}>{pName}</td>
                        <td style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {b.passenger?.passportNumber || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--sky-blue)' }}>
                          ✈️ {b.flightNumber}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {b.gate ? `Gate ${b.gate.gateNumber || b.gate.gateCode}` : 'Unassigned'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--sky-blue)' }}>
                            {b.seatNumber || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>🧳 {b.baggageCount || 0}</td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          {isCheckedIn ? (
                            <span className="badge-status available" style={{ fontSize: '0.75rem' }}>
                              <span className="badge-dot"></span>Checked In
                            </span>
                          ) : (
                            <span className="badge-status maintenance" style={{ fontSize: '0.75rem' }}>
                              <span className="badge-dot"></span>{b.status}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {b.checkInTime || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : results.type === 'airports' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Airport Name', 'IATA Code', 'City'].map((h) => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>#{a.id}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)', fontWeight: 600 }}>{a.name}</td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span className="badge-status on-time" style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}>
                          {a.airportCode}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>
                        {a.city?.name ? `${a.city.name} (${a.city.province || ''})` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Planes table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Aircraft Type', 'Airline', 'Capacity'].map((h) => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((pl) => (
                    <tr key={pl.id || pl.ID} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>#{pl.id || pl.ID}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-h)', fontWeight: 600 }}>{pl.type}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{pl.airlineName || '—'}</td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>{pl.numOfPassengers} seats</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
