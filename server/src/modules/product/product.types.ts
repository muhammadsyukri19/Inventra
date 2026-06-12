import { z } from 'zod';
import { createProductSchema, updateProductSchema } from './product.schema';
import { Decimal } from '@prisma/client/runtime/library';

export type CreateProductPayload = z.infer<typeof createProductSchema>['body'];
export type UpdateProductPayload = z.infer<typeof updateProductSchema>['body'];

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number | Decimal;
  costPrice: number | Decimal;
  categoryId: string;
  supplierId: string | null;
  unit: string;
  imageUrl: string | null;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  } | null;
  inventory?: {
    currentStock: number;
    minStock: number;
    maxStock: number;
    reorderPoint: number;
    safetyStock: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
