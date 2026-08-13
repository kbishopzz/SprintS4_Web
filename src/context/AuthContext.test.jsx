import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthProvider, useAuth } from './AuthContext';

function ConsumerComponent() {
  const { user, token, isAuthenticated } = useAuth();
  return (
    <div>
      <span id="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span id="user-name">{user ? user.username : 'no-user'}</span>
      <span id="token-val">{token || 'no-token'}</span>
    </div>
  );
}

describe('AuthContext & AuthProvider', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    const localStorageMock = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value.toString();
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };

    vi.stubGlobal('window', { localStorage: localStorageMock });
    vi.stubGlobal('localStorage', localStorageMock);
    vi.restoreAllMocks();
  });

  it('renders default unauthenticated state when localStorage is empty', () => {
    const html = renderToString(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(html).toContain('unauthenticated');
    expect(html).toContain('no-user');
    expect(html).toContain('no-token');
  });

  it('restores authenticated state from localStorage on initial render', () => {
    localStorage.setItem('token', 'stored-token-abc');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'MReid', role: 'ADMIN' }));

    const html = renderToString(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(html).toContain('authenticated');
    expect(html).toContain('MReid');
    expect(html).toContain('stored-token-abc');
  });

  it('restores authenticated state for Kbishop from localStorage', () => {
    localStorage.setItem('token', 'kbishop-token');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'Kbishop', role: 'ADMIN', provider: 'keycloak' }));

    const html = renderToString(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(html).toContain('authenticated');
    expect(html).toContain('Kbishop');
  });

  it('restores authenticated state for CRubia from localStorage', () => {
    localStorage.setItem('token', 'crubia-token');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'CRubia', role: 'ADMIN', provider: 'keycloak' }));

    const html = renderToString(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(html).toContain('authenticated');
    expect(html).toContain('CRubia');
  });

  it('throws an error when useAuth is used outside an AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderToString(<ConsumerComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    spy.mockRestore();
  });
});
