import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { ApiSuccessResponse } from '@/types/api.types';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE';
  role: {
    id: string;
    name: string;
  };
  lastLoginAt: string | null;
  createdAt: string;
}

export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<User[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<User[]>>(
    API_ENDPOINTS.USERS,
    { params }
  );
  return data.data;
}

export async function updateUserStatus(id: string, status: string): Promise<User> {
  const { data } = await apiClient.patch<ApiSuccessResponse<User>>(
    `${API_ENDPOINTS.USERS}/${id}/status`,
    { status }
  );
  return data.data;
}
