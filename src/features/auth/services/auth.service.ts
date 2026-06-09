import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { UserProfile } from '@/types/common.types';

/**
 * Auth service.
 *
 * Handles all auth-related API calls.
 * Components should use hooks (useAuth) instead of calling these directly.
 */

interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password?: string;
  roleId: string;
}

interface LoginResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponseData> {
  const { data } = await apiClient.post<ApiSuccessResponse<LoginResponseData>>(
    API_ENDPOINTS.AUTH_LOGIN,
    payload
  );
  return data.data;
}

export async function registerUser(payload: RegisterPayload): Promise<any> {
  const { data } = await apiClient.post<ApiSuccessResponse<any>>(
    API_ENDPOINTS.AUTH_REGISTER,
    payload
  );
  return data;
}

export async function refreshToken(token: string): Promise<RefreshResponseData> {
  const { data } = await apiClient.post<ApiSuccessResponse<RefreshResponseData>>(
    API_ENDPOINTS.AUTH_REFRESH,
    { refreshToken: token }
  );
  return data.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
}

export async function getCurrentUser(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiSuccessResponse<UserProfile>>(
    API_ENDPOINTS.AUTH_ME
  );
  return data.data;
}
