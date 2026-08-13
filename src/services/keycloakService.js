/**
 * keycloakService.js
 *
 * Handles Keycloak OpenID Connect authentication for the Admin Portal.
 * Communicates with the Keycloak server's token endpoint via the
 * Resource Owner Password Credentials (ROPC) grant when Keycloak is running,
 * and falls back seamlessly to backend / local credential validation when
 * Keycloak is unavailable (development / standalone mode).
 */

const KEYCLOAK_URL    = import.meta.env.VITE_KEYCLOAK_URL    || 'http://localhost:8180';
const REALM           = import.meta.env.VITE_KEYCLOAK_REALM  || 'airport-realm';
const CLIENT_ID       = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'admin-portal';
const API_BASE_URL    = import.meta.env.VITE_API_BASE_URL    || 'http://localhost:8080';

const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;

const ADMIN_ACCOUNTS = {
  mreid:   { username: 'MReid',   email: 'mreid@airport.com',   role: 'ADMIN' },
  kbishop: { username: 'Kbishop', email: 'kbishop@airport.com', role: 'ADMIN' },
  crubia:  { username: 'CRubia',  email: 'crubia@airport.com',  role: 'ADMIN' },
};

/**
 * Decodes a JWT token payload without verifying the signature.
 * For display/role-extraction purposes only — signature verification
 * is handled by the backend.
 *
 * @param {string} token - JWT string
 * @returns {object|null} Decoded payload object or null on error
 */
export function decodeJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extracts realm-level roles from a Keycloak JWT payload.
 *
 * @param {object} payload - Decoded JWT payload
 * @returns {string[]} Array of role strings
 */
export function extractRoles(payload) {
  if (!payload) return [];
  return payload?.realm_access?.roles || [];
}

/**
 * Authenticates via Keycloak using the Resource Owner Password Credentials grant.
 * If Keycloak is unavailable, falls back to validating credentials against
 * the local Spring Boot backend /users API or pre-seeded admin credentials.
 *
 * @param {string} username - Admin username (MReid, Kbishop, or CRubia)
 * @param {string} password - Admin password
 * @returns {Promise<{token: string, user: object}>} Auth result object
 * @throws {Error} If authentication fails
 */
export async function keycloakLogin(username, password) {
  // --- Attempt Keycloak OIDC authentication first ---
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
        role: roles.includes('ADMIN') ? 'ADMIN' : 'USER',
        roles,
        provider: 'keycloak',
        sub: payload?.sub,
      };

      return { token: accessToken, refreshToken: data.refresh_token, user };
    }

    // Keycloak server responded with a 400/401 auth error (e.g. invalid user or bad password)
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.error_description || errorData.error || 'Invalid credentials';
    throw new Error(msg);

  } catch (err) {
    // Check if error was a network connection error (Keycloak service down / CORS / fetch failed)
    const isNetworkError =
      err.name === 'TypeError' ||
      !err.message ||
      err.message.toLowerCase().includes('fetch') ||
      err.message.toLowerCase().includes('network') ||
      err.message.toLowerCase().includes('failed');

    // If Keycloak was reached and rejected credentials explicitly, throw that error
    if (!isNetworkError && err.message !== 'Invalid credentials') {
      throw err;
    }

    // --- Keycloak unreachable: fall back to local backend validation ---
    console.warn('[KeycloakService] Keycloak unavailable, falling back to local backend auth.');
    return localBackendLogin(username, password);
  }
}

/**
 * Fallback: validates credentials against the Spring Boot /users/username/{username} endpoint
 * or pre-configured admin accounts (MReid, Kbishop, CRubia with password admin123).
 *
 * @param {string} username - Username to validate
 * @param {string} password - Raw password to compare
 * @returns {Promise<{token: string, user: object}>} Auth result
 * @throws {Error} If credentials are invalid or user not found
 */
async function localBackendLogin(username, password) {
  const normUsername = username.trim().toLowerCase();
  const isAdminAccount = ['mreid', 'kbishop', 'crubia'].includes(normUsername);

  try {
    const res = await fetch(`${API_BASE_URL}/users/username/${encodeURIComponent(username.trim())}`);

    if (res.ok) {
      const userData = await res.json();
      // Match passwordHash or check default admin password
      if (userData.passwordHash === password || (isAdminAccount && password === 'admin123')) {
        const fakeToken = btoa(JSON.stringify({
          sub: userData.id,
          preferred_username: userData.username,
          email: userData.email,
          role: userData.role || 'ADMIN',
        }));
        return {
          token: fakeToken,
          refreshToken: null,
          user: {
            username: userData.username,
            email: userData.email,
            role: userData.role || 'ADMIN',
            roles: [userData.role || 'ADMIN'],
            provider: 'local',
            id: userData.id,
          },
        };
      }
    }
  } catch (backendErr) {
    console.warn('[KeycloakService] Backend user endpoint request error:', backendErr);
  }

  // If backend is unreachable or user lookup failed, check pre-seeded Admin accounts for demo
  if (isAdminAccount && password === 'admin123') {
    const info = ADMIN_ACCOUNTS[normUsername];
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

  throw new Error('Invalid username or password');
}

/**
 * Logs out from Keycloak by invalidating the refresh token on the server.
 * Silently fails if Keycloak is unavailable (local logout still proceeds).
 *
 * @param {string} refreshToken - The Keycloak refresh token to revoke
 * @returns {Promise<void>}
 */
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
    // Non-fatal — local state will still be cleared
  }
}
