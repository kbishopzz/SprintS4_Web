import axios from 'axios';

// Get backend API base URL from Vite environment variables or default to relative path (for reverse proxy)
const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : '';

// Helper to safely get item from localStorage
const getStoredToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('token') || localStorage.getItem('auth_token');
  }
  return null;
};

// Helper to safely remove item from localStorage
const removeStoredToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  }
};

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Auth token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        removeStoredToken();
      }
      console.error(`[API Error ${error.response.status}]:`, error.response.data || error.response.statusText);
    } else if (error.request) {
      console.error('[API Error]: No response received from server', error.request);
    } else {
      console.error('[API Error]:', error.message);
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   Domain-Specific API Methods (Synchronised with Backend & CLI)
   ============================================================ */

// ---------- Airports ----------
export const airportApi = {
  getAll:      ()         => apiClient.get('/api/airports'),
  getById:     (id)       => apiClient.get(`/api/airports/${id}`),
  create:      (data)     => apiClient.post('/api/airports', data),
  update:      (id, data) => apiClient.put(`/api/airports/${id}`, data),
  delete:      (id)       => apiClient.delete(`/api/airports/${id}`),
  getGates:    (id)       => apiClient.get(`/api/airports/${id}/gates`),
};

// ---------- Cities ----------
export const cityApi = {
  getAll:      (page=0, size=20, sort='') =>
    apiClient.get(`/api/cities?page=${page}&size=${size}${sort ? `&sort=${encodeURIComponent(sort)}` : ''}`),
  getById:     (id)       => apiClient.get(`/api/cities/${id}`),
  create:      (data)     => apiClient.post('/api/cities', data),
  update:      (id, data) => apiClient.put(`/api/cities/${id}`, data),
  delete:      (id)       => apiClient.delete(`/api/cities/${id}`),
  getAirports: (id)       => apiClient.get(`/api/cities/${id}/airports`),
};

// ---------- Planes ----------
export const planeApi = {
  getAll:      ()         => apiClient.get('/api/planes'),
  getById:     (id)       => apiClient.get(`/api/planes/${id}`),
  create:      (data)     => apiClient.post('/api/planes', data),
  update:      (id, data) => apiClient.put(`/api/planes/${id}`, data),
  delete:      (id)       => apiClient.delete(`/api/planes/${id}`),
  getAirports: (id)       => apiClient.get(`/api/planes/${id}/airports`),
};

// ---------- Passengers ----------
export const passengerApi = {
  getAll:      (page=0, size=20, sort='') =>
    apiClient.get(`/api/passengers?page=${page}&size=${size}${sort ? `&sort=${encodeURIComponent(sort)}` : ''}`),
  getById:     (id)       => apiClient.get(`/api/passengers/${id}`),
  create:      (data)     => apiClient.post('/api/passengers', data),
  update:      (id, data) => apiClient.put(`/api/passengers/${id}`, data),
  delete:      (id)       => apiClient.delete(`/api/passengers/${id}`),
  getPlanes:   (id)       => apiClient.get(`/api/passengers/${id}/planes`),
  getAirports: (id)       => apiClient.get(`/api/passengers/${id}/airports`),
};

// ---------- Gates ----------
export const gateApi = {
  getAll:        ()         => apiClient.get('/api/gates'),
  getById:       (id)       => apiClient.get(`/api/gates/${id}`),
  getByAirport:  (airportId)=> apiClient.get(`/api/gates/airport/${airportId}`),
  create:        (data)     => apiClient.post('/api/gates', data),
  update:        (id, data) => apiClient.put(`/api/gates/${id}`, data),
  delete:        (id)       => apiClient.delete(`/api/gates/${id}`),
};

// ---------- Airlines ----------
export const airlineApi = {
  getAll:      ()         => apiClient.get('/api/airlines'),
  getById:     (id)       => apiClient.get(`/api/airlines/${id}`),
  getByCode:   (code)     => apiClient.get(`/api/airlines/code/${code}`),
  create:      (data)     => apiClient.post('/api/airlines', data),
  update:      (id, data) => apiClient.put(`/api/airlines/${id}`, data),
  delete:      (id)       => apiClient.delete(`/api/airlines/${id}`),
};

// ---------- Bookings ----------
export const bookingApi = {
  getAll:         ()         => apiClient.get('/api/bookings'),
  getById:        (id)       => apiClient.get(`/api/bookings/${id}`),
  getByReference: (ref)      => apiClient.get(`/api/bookings/reference/${ref}`),
  getByPassenger: (id)       => apiClient.get(`/api/bookings/passenger/${id}`),
  getManifest:    (flightNumber, gateId, status = 'CHECKED_IN') => {
    const params = new URLSearchParams();
    if (flightNumber) params.append('flightNumber', flightNumber);
    if (gateId) params.append('gateId', gateId);
    if (status) params.append('status', status);
    return apiClient.get(`/api/bookings/manifest?${params.toString()}`);
  },
  create:         (data)     => apiClient.post('/api/bookings', data),
  update:         (id, data) => apiClient.put(`/api/bookings/${id}`, data),
  checkIn:        (id)       => apiClient.put(`/api/bookings/${id}/checkin`),
  delete:         (id)       => apiClient.delete(`/api/bookings/${id}`),
};

// ---------- Users ----------
export const userApi = {
  getAll:        ()          => apiClient.get('/users'),
  getById:       (id)        => apiClient.get(`/users/${id}`),
  getByUsername:  (username)  => apiClient.get(`/users/username/${username}`),
  create:        (data)      => apiClient.post('/users', data),
  update:        (id, data)  => apiClient.put(`/users/${id}`, data),
  delete:        (id)        => apiClient.delete(`/users/${id}`),
};

export default apiClient;
