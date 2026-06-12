import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { OwnerAnalytics, StaffAnalytics, AdminAnalytics } from '../types/analytics.types';

export const analyticsService = {

  getOwnerDashboard: async (): Promise<OwnerAnalytics> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.ANALYTICS_DASHBOARD_OWNER);
    return data.data;
  },

  getStaffDashboard: async (): Promise<StaffAnalytics> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.ANALYTICS_DASHBOARD_STAFF);
    return data.data;
  },

  getAdminDashboard: async (): Promise<AdminAnalytics> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.ANALYTICS_DASHBOARD_ADMIN);
    return data.data;
  },
};

