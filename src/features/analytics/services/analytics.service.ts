import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const analyticsService = {
  getDashboardData: async <T>(role?: string): Promise<T> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.ANALYTICS_DASHBOARD_ROLE,
      { params: role ? { role } : undefined }
    );
    // data.data has the envelopes: { success: true, data: { ... } }
    return data.data?.data || data.data;
  },
};
