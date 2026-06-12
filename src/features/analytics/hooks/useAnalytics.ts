import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { analyticsService } from '../services/analytics.service';

/**
 * Hook for fetching role-specific analytics data
 */
export function useAnalyticsDashboard<T>(role?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS_DASHBOARD_ROLE(role),
    queryFn: () => analyticsService.getDashboardData<T>(role),
    enabled: true, // Fetch automatically
    placeholderData: (previousData) => previousData,
  });
}
