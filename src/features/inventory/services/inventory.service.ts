import apiClient from '@/services/api-client'; 
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { PaginationMeta } from '@/types/api.types';
import type { Inventory, AdjustStockPayload, UpdateInventorySettingsPayload, InventoryQueryParams } from '../types/inventory.types';

export const inventoryService = {
  /**
   * Validate barcode for scanning
   */
  validateBarcode: async (code: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_VALIDATE(code));
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error('Produk tidak terdaftar atau kode salah');
    }
  },

  /**
   * Get all inventories with filters
   */
  getInventories: async (params?: InventoryQueryParams): Promise<{ data: Inventory[]; meta: PaginationMeta }> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.INVENTORIES,
      { params }
    );
    // data.data is { data: Inventory[], meta: PaginationMeta, message: string }
    return {
      data: data.data?.data || [],
      meta: data.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  /**
   * Get inventory detail by product ID
   */
  getInventoryByProductId: async (productId: string): Promise<Inventory> => {
    const { data } = await apiClient.get<any>(
      API_ENDPOINTS.INVENTORY_DETAIL(productId)
    );
    return data.data?.data || data.data;
  },

  /**
   * Manually adjust stock (IN, OUT, or ADJUSTMENT)
   */
  adjustStock: async (productId: string, payload: AdjustStockPayload): Promise<Inventory> => {
    const { data } = await apiClient.post<any>(
      API_ENDPOINTS.INVENTORY_ADJUST(productId),
      payload
    );
    return data.data?.data || data.data;
  },

  /**
   * Update inventory thresholds and settings
   */
  updateSettings: async (
    productId: string,
    payload: UpdateInventorySettingsPayload
  ): Promise<Inventory> => {
    const { data } = await apiClient.patch<any>(
      API_ENDPOINTS.INVENTORY_SETTINGS(productId),
      payload
    );
    return data.data?.data || data.data;
  },
};