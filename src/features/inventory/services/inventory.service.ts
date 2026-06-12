import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { PaginationMeta } from '@/types/api.types';
import type { Inventory, AdjustStockPayload, UpdateInventorySettingsPayload, InventoryQueryParams } from '../types/inventory.types';

// Pastikan namanya 'inventoryService'
export const inventoryService = {
  validateBarcode: async (code: string) => {
    return await apiClient.get(API_ENDPOINTS.PRODUCT_VALIDATE(code));
  },
  getAllProducts: async () => {
    return await apiClient.get(API_ENDPOINTS.PRODUCTS);
  },
  deleteProduct: async (id: string) => {
    return await apiClient.delete(API_ENDPOINTS.PRODUCT_DETAIL(id));
  },
  getInventories: async (params?: InventoryQueryParams): Promise<{ data: Inventory[]; meta: PaginationMeta }> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.INVENTORIES,
      { params }
    );
    return {
      data: data.data?.data || [],
      meta: data.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },
  getInventoryByProductId: async (productId: string): Promise<Inventory> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.INVENTORY_DETAIL(productId)
    );
    return data.data?.data || data.data;
  },
  adjustStock: async (productId: string, payload: AdjustStockPayload): Promise<Inventory> => {
    const { data } = await apiClient.post<any>(
      API_ENDPOINTS.INVENTORY_ADJUST(productId),
      payload
    );
    return data.data?.data || data.data;
  },
  updateSettings: async (productId: string, payload: UpdateInventorySettingsPayload): Promise<Inventory> => {
    const { data } = await apiClient.put<any>(
      API_ENDPOINTS.INVENTORY_SETTINGS(productId),
      payload
    );
    return data.data?.data || data.data;
  }
};