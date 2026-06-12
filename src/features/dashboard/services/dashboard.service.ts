import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface DashboardSummaryData {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  monthlySalesCount: number;
  totalTransactions: number;
}

export const dashboardService = {
  /**
   * Get dashboard summary metrics
   */
  getSummary: async (): Promise<DashboardSummaryData> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.DASHBOARD_SUMMARY);
    return data.data;
  },
};
