import { createContext, useContext, useState } from 'react';

// Create AuthContext
export const AuthContext = createContext(null);

/**
 * AuthProvider component to wrap the application and provide authentication state.
 */
export function AuthProvider({ children }) {
  // Initialize state synchronously from localStorage if available
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token') || localStorage.getItem('auth_token') || null;
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
        return { username: 'admin' };
      }
    }
    return null;
  });

  const [loading] = useState(false);

  /**
   * Log in user, store token/user payload in localStorage and context state.
   *
   * @param {Object|string} userData - User information object or username string
   * @param {string} tokenData - Authentication token string
   */
  const login = (userData, tokenData = 'mock-jwt-token-xyz') => {
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
   * Log out user, clear state and localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Failed to clear auth details from localStorage:', err);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user || token),
    loading,
    login,
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
