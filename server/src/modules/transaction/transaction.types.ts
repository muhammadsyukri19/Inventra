import { z } from 'zod';
import { createTransactionSchema } from './transaction.schema';

export type CreateTransactionPayload = z.infer<typeof createTransactionSchema>['body'];

export interface TransactionResponse {
  id: string;
  transactionCode: string;
  type: 'IN' | 'OUT';
  createdById: string;
  notes: string | null;
  totalAmount: number;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    name: string;
  };
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      sku: string;
      name: string;
    }
  }>;
}
