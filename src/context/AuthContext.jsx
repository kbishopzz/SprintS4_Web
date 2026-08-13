import { createContext, useContext, useState } from 'react';
import { keycloakLogin, keycloakLogout } from '../services/keycloakService';

// Create AuthContext
export const AuthContext = createContext(null);

/**
 * AuthProvider component to wrap the application and provide Keycloak-backed
 * authentication state to all child components.
 */
export function AuthProvider({ children }) {
  // Initialize state synchronously from localStorage if available
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token') || localStorage.getItem('auth_token') || null;
    }
    return null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('refresh_token') || null;
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUserRaw = localStorage.getItem('auth_user') || localStorage.getItem('user');
      if (storedUserRaw) {
        try {
          return JSON.parse(storedUserRaw);
        } catch {
          return { username: storedUserRaw };
        }
      }
      const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (storedToken) {
        return { username: 'Admin' };
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Log in via Keycloak (with local backend fallback).
   * Stores access token, refresh token, and user profile in localStorage and context state.
   *
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<boolean>} true on success, false on failure
   */
  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await keycloakLogin(username, password);
      const { token: accessToken, refreshToken: rt, user: userObj } = result;

      setUser(userObj);
      setToken(accessToken);
      setRefreshToken(rt || null);

      try {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('auth_user', JSON.stringify(userObj));
        if (rt) localStorage.setItem('refresh_token', rt);
      } catch (err) {
        console.error('Failed to save auth details to localStorage:', err);
      }

      return true;
    } catch (err) {
      const message = err?.message || 'Authentication failed. Please check your credentials.';
      setAuthError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Directly log in a user with a pre-built user object and token (for test/SSR use).
   *
   * @param {Object|string} userData - User information object or username string
   * @param {string} tokenData - Authentication token string
   */
  const loginDirect = (userData, tokenData = 'mock-jwt-token-xyz') => {
    const userObj = typeof userData === 'string' ? { username: userData } : userData;
    const finalToken = tokenData || 'mock-jwt-token-xyz';

    setUser(userObj);
    setToken(finalToken);

    try {
      localStorage.setItem('token', finalToken);
      localStorage.setItem('auth_token', finalToken);
      localStorage.setItem('auth_user', JSON.stringify(userObj));
    } catch (err) {
      console.error('Failed to save auth details to localStorage:', err);
    }
  };

  /**
   * Log out user, revoke Keycloak refresh token, and clear all local state.
   */
  const logout = async () => {
    const rt = refreshToken;
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setAuthError(null);

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('user');
      localStorage.removeItem('refresh_token');
    } catch (err) {
      console.error('Failed to clear auth details from localStorage:', err);
    }

    // Revoke Keycloak session (non-blocking)
    await keycloakLogout(rt);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user || token),
    loading,
    authError,
    login,
    loginDirect,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume AuthContext cleanly.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
