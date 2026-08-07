import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient from './ApiClient';

describe('ApiClient', () => {
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

  it('should have default baseURL configured', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(typeof apiClient.defaults.baseURL).toBe('string');
  });

  it('should attach Authorization header when token is stored in localStorage', async () => {
    localStorage.setItem('token', 'test-jwt-token');

    const requestInterceptor = apiClient.interceptors.request.handlers[0];
    const config = { headers: {} };
    const updatedConfig = await requestInterceptor.fulfilled(config);

    expect(updatedConfig.headers.Authorization).toBe('Bearer test-jwt-token');
  });

  it('should not attach Authorization header when no token exists', async () => {
    const requestInterceptor = apiClient.interceptors.request.handlers[0];
    const config = { headers: {} };
    const updatedConfig = await requestInterceptor.fulfilled(config);

    expect(updatedConfig.headers.Authorization).toBeUndefined();
  });

  it('should remove token on 401 response error in response interceptor', async () => {
    localStorage.setItem('token', 'expired-token');

    const responseInterceptor = apiClient.interceptors.response.handlers[0];
    const errorResponse = {
      response: {
        status: 401,
        data: 'Unauthorized',
      },
    };

    try {
      await responseInterceptor.rejected(errorResponse);
    } catch (err) {
      expect(err).toEqual(errorResponse);
    }

    expect(localStorage.getItem('token')).toBeNull();
  });
});
