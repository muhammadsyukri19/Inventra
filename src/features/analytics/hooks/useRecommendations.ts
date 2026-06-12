import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { recommendationService } from '../services/recommendation.service';
import type { RecommendationStatus } from '../types/recommendation.types';

/**
 * Hook for loading restock recommendations list
 */
export function useRecommendations() {
  return useQuery({
    queryKey: QUERY_KEYS.RECOMMENDATIONS(),
    queryFn: () => recommendationService.getRecommendations(),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for manual trigger of ML forecasting prediction (Admin only)
 */
export function useTriggerPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recommendationService.triggerPrediction(),
    onSuccess: () => {
      // Invalidate recommendations query to load updated ones
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECOMMENDATIONS() });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook for updating restock recommendation status (Approve / Reject)
 */
export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecommendationStatus }) =>
      recommendationService.updateStatus(id, status),
    onSuccess: () => {
      // Invalidate recommendations query to refresh the status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECOMMENDATIONS() });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
