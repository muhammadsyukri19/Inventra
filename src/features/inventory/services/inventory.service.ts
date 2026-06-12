import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

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
  }
};