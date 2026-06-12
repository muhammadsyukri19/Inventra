import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

/**
 * Axios API client with interceptors.
 *
 * Features:
 * - Automatic Authorization header injection
 * - Automatic token refresh on 401 responses
 * - Request/response error handling
 */

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',  
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR — TOKEN REFRESH
// ============================================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip refresh for login/refresh endpoints
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === API_ENDPOINTS.AUTH_LOGIN ||
      originalRequest.url === API_ENDPOINTS.AUTH_REFRESH
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const response = await axios.post(API_ENDPOINTS.AUTH_REFRESH, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data.data;

      setTokens(newAccessToken, newRefreshToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
