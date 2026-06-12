import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';


/**
 * Hook for fetching Owner-specific analytics data
 */
export function useOwnerAnalytics(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'owner'],
    queryFn: () => analyticsService.getOwnerDashboard(),
    enabled,
  });
}

/**
 * Hook for fetching Staff-specific analytics data
 */
export function useStaffAnalytics(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'staff'],
    queryFn: () => analyticsService.getStaffDashboard(),
    enabled,
  });
}

/**
 * Hook for fetching Admin-specific analytics data
 */
export function useAdminAnalytics(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'admin'],
    queryFn: () => analyticsService.getAdminDashboard(),
    enabled,
  });
}

