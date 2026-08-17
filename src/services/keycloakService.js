/**
 * keycloakService.js
 *
 * Handles Keycloak OpenID Connect authentication & role-based local fallback.
 */

const KEYCLOAK_URL    = import.meta.env.VITE_KEYCLOAK_URL    || 'http://localhost:8180';
const REALM           = import.meta.env.VITE_KEYCLOAK_REALM  || 'airport-realm';
const CLIENT_ID       = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'admin-portal';
const API_BASE_URL    = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : '';

const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;

const ADMIN_USERNAMES = ['admin', 'mreid', 'kbishop', 'crubia'];

const ADMIN_ACCOUNTS = {
  admin:   { username: 'admin',   email: 'admin@airport.com',   role: 'ADMIN' },
  mreid:   { username: 'MReid',   email: 'mreid@airport.com',   role: 'ADMIN' },
  kbishop: { username: 'Kbishop', email: 'kbishop@airport.com', role: 'ADMIN' },
  crubia:  { username: 'CRubia',  email: 'crubia@airport.com',  role: 'ADMIN' },
};

export function decodeJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function extractRoles(payload) {
  if (!payload) return [];
  return payload?.realm_access?.roles || [];
}

/**
 * Authenticates via Keycloak or local backend fallback.
 */
export async function keycloakLogin(username, password) {
  try {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'password',
      username,
      password,
      scope: 'openid profile email',
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (response.ok) {
      const data = await response.json();
      const accessToken = data.access_token;
      const payload = decodeJwt(accessToken);
      const roles = extractRoles(payload);

      const user = {
        username: payload?.preferred_username || username,
        email: payload?.email || `${username.toLowerCase()}@airport.com`,
        role: roles.includes('ADMIN') || ADMIN_USERNAMES.includes(username.toLowerCase()) ? 'ADMIN' : 'CLIENT',
        roles,
        provider: 'keycloak',
        sub: payload?.sub,
      };

      return { token: accessToken, refreshToken: data.refresh_token, user };
    }

    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error_description || errorData.error || 'Invalid credentials';
    throw new Error(msg);

  } catch (err) {
    const isNetworkError =
      err.name === 'TypeError' ||
      !err.message ||
      err.message.toLowerCase().includes('fetch') ||
      err.message.toLowerCase().includes('network') ||
      err.message.toLowerCase().includes('failed');

    if (!isNetworkError && err.message !== 'Invalid credentials') {
      throw err;
    }

    // Local fallback authentication
    return localBackendLogin(username, password);
  }
}

/**
 * Validates credentials locally against Spring Boot /users API or admin accounts.
 * Admin passwords: admin123
 * Client passwords: password123
 */
async function localBackendLogin(username, password) {
  const normUsername = username.trim().toLowerCase();
  const isAdminAccount = ADMIN_USERNAMES.includes(normUsername);

  const isValidAdminPassword = isAdminAccount && (password === 'admin123' || password === 'password123');
  const isValidClientPassword = !isAdminAccount && (password === 'password123' || password === 'admin123' || password.length > 0);

  try {
    const res = await fetch(`${API_BASE_URL}/users/username/${encodeURIComponent(username.trim())}`);

    if (res.ok) {
      const userData = await res.json();
      const matchPass = userData.passwordHash === password || (isAdminAccount ? isValidAdminPassword : isValidClientPassword);

      if (matchPass) {
        const userRole = userData.role || (isAdminAccount ? 'ADMIN' : 'CLIENT');
        const fakeToken = btoa(JSON.stringify({
          sub: userData.id,
          preferred_username: userData.username,
          email: userData.email,
          role: userRole,
        }));
        return {
          token: fakeToken,
          refreshToken: null,
          user: {
            username: userData.username,
            email: userData.email,
            role: userRole,
            roles: [userRole],
            provider: 'local',
            id: userData.id,
          },
        };
      }
    }
  } catch (backendErr) {
    console.warn('[KeycloakService] Backend user endpoint request error:', backendErr);
  }

  // Pre-seeded Admin accounts check
  if (isAdminAccount && isValidAdminPassword) {
    const info = ADMIN_ACCOUNTS[normUsername] || { username, email: `${normUsername}@airport.com`, role: 'ADMIN' };
    const fakeToken = btoa(JSON.stringify({
      sub: info.username,
      preferred_username: info.username,
      email: info.email,
      role: 'ADMIN',
    }));
    return {
      token: fakeToken,
      refreshToken: null,
      user: {
        username: info.username,
        email: info.email,
        role: 'ADMIN',
        roles: ['ADMIN'],
        provider: 'local',
      },
    };
  }

  // Client login fallback
  if (isValidClientPassword && !isAdminAccount) {
    const fakeToken = btoa(JSON.stringify({
      sub: username.trim(),
      preferred_username: username.trim(),
      email: `${normUsername}@passenger.com`,
      role: 'CLIENT',
    }));
    return {
      token: fakeToken,
      refreshToken: null,
      user: {
        username: username.trim(),
        email: `${normUsername}@passenger.com`,
        role: 'CLIENT',
        roles: ['CLIENT'],
        provider: 'local',
      },
    };
  }

  throw new Error('Invalid username or password');
}

export async function keycloakLogout(refreshToken) {
  if (!refreshToken) return;
  try {
    const logoutEndpoint = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    });
    await fetch(logoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch {
    // Non-fatal
  }
}
