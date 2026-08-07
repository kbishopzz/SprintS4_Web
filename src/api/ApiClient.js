import axios from 'axios';

// Get backend API base URL from Vite environment variables or default to http://localhost:8080
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

export default apiClient;
