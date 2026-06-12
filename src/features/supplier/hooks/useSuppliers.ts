import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { supplierService } from '../services/supplier.service';
import type { CreateSupplierPayload, UpdateSupplierPayload, SupplierQueryParams } from '../types/supplier.types';

/**
 * Hook for fetching suppliers with caching, pagination, and search filtering
 */
export function useSuppliers(params?: SupplierQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPLIERS(params),
    queryFn: () => supplierService.getSuppliers(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching a single supplier detail
 */
export function useSupplierDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPLIER_DETAIL(id),
    queryFn: () => supplierService.getSupplierById(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook for creating a new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => supplierService.createSupplier(payload),
    onSuccess: () => {
      // Invalidate the suppliers query cache to reload list
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

/**
 * Hook for updating an existing supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      supplierService.updateSupplier(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate both the list and specific detail query
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIER_DETAIL(variables.id) });
    },
  });
}

/**
 * Hook for toggling supplier status (Active/Inactive)
 */
export function useToggleSupplierStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      supplierService.toggleSupplierStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIER_DETAIL(variables.id) });
    },
  });
}
