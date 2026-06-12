export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: {
    name: string;
  };
}

export interface Inventory {
  id: string;
  productId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  safetyStock: number;
  leadTimeDays: number;
  lastRestockAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: InventoryProduct;
}

export interface AdjustStockPayload {
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
}

export interface UpdateInventorySettingsPayload {
  minStock: number;
  maxStock: number;
  safetyStock?: number;
  reorderPoint?: number;
  leadTimeDays: number;
}

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  stockStatus?: 'low' | 'out' | 'safe';
}
