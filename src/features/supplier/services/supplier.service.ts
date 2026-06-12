import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { PaginationMeta } from '@/types/api.types';
import type { Supplier, CreateSupplierPayload, UpdateSupplierPayload, SupplierQueryParams } from '../types/supplier.types';

export const supplierService = {
  /**
   * Get all suppliers with pagination and search
   */
  getSuppliers: async (params?: SupplierQueryParams): Promise<{ data: Supplier[]; meta: PaginationMeta }> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.SUPPLIERS,
      { params }
    );
    // data.data is { data: Supplier[], meta: PaginationMeta, message: string }
    return {
      data: data.data?.data || [],
      meta: data.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  /**
   * Get supplier detail by ID
   */
  getSupplierById: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.SUPPLIER_DETAIL(id)
    );
    return data.data?.data || data.data;
  },

  /**
   * Create a new supplier
   */
  createSupplier: async (payload: CreateSupplierPayload): Promise<Supplier> => {
    const { data } = await apiClient.post<any>(
      API_ENDPOINTS.SUPPLIERS,
      payload
    );
    return data.data?.data || data.data;
  },

  /**
   * Update an existing supplier
   */
  updateSupplier: async (id: string, payload: UpdateSupplierPayload): Promise<Supplier> => {
    const { data } = await apiClient.put<any>(
      API_ENDPOINTS.SUPPLIER_DETAIL(id),
      payload
    );
    return data.data?.data || data.data;
  },

  /**
   * Toggle supplier active/inactive status
   */
  toggleSupplierStatus: async (id: string, isActive: boolean): Promise<Supplier> => {
    const { data } = await apiClient.patch<any>(
      `${API_ENDPOINTS.SUPPLIERS}/${id}/status`,
      { isActive }
    );
    return data.data?.data || data.data;
  },
};
