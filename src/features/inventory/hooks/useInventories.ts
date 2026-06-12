import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { inventoryService } from '../services/inventory.service';
import type { AdjustStockPayload, UpdateInventorySettingsPayload, InventoryQueryParams } from '../types/inventory.types';

/**
 * Hook for fetching inventories list with filters and page state
 */
export function useInventories(params?: InventoryQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORIES(params),
    queryFn: () => inventoryService.getInventories(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching single inventory detail by product ID
 */
export function useInventoryDetail(productId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORY_DETAIL(productId),
    queryFn: () => inventoryService.getInventoryByProductId(productId),
    enabled: enabled && !!productId,
  });
}

/**
 * Hook for manual stock adjustments
 */
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: AdjustStockPayload }) =>
      inventoryService.adjustStock(productId, payload),
    onSuccess: (_, variables) => {
      // Invalidate the inventories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY_DETAIL(variables.productId) });
      // Invalidate dashboard summaries and alerts if any
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Hook for updating inventory settings (thresholds, lead time)
 */
export function useUpdateInventorySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: UpdateInventorySettingsPayload;
    }) => inventoryService.updateSettings(productId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY_DETAIL(variables.productId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
