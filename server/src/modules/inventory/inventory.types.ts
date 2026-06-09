import { z } from 'zod';
import { updateInventorySettingsSchema, adjustStockSchema } from './inventory.schema';

export type UpdateInventorySettingsPayload = z.infer<typeof updateInventorySettingsSchema>['body'];
export type AdjustStockPayload = z.infer<typeof adjustStockSchema>['body'];

export interface InventoryResponse {
  id: string;
  productId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  safetyStock: number;
  leadTimeDays: number;
  lastRestockAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    sku: string;
    name: string;
  };
}
