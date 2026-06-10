import apiClient from '@/services/api-client'; 
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const inventoryService = {
  // Fungsi untuk memvalidasi barcode hasil scan
  validateBarcode: async (code: string) => {
    try {
      // Memanggil endpoint produk dari API
      const response = await apiClient.get(API_ENDPOINTS.PRODUCT_VALIDATE(code));
      return response.data; // Mengembalikan data produk { id, name, price, stock, dll }
    } catch (error) {
      // Jika error (misal 404 produk tidak ditemukan), lempar error ke UI
      throw new Error('Produk tidak terdaftar atau kode salah');
    }
  },
};