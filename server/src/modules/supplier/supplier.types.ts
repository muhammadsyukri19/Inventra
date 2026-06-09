import { z } from 'zod';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema';

export type CreateSupplierPayload = z.infer<typeof createSupplierSchema>['body'];
export type UpdateSupplierPayload = z.infer<typeof updateSupplierSchema>['body'];

export interface SupplierResponse {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
