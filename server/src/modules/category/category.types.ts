import { z } from 'zod';
import { createCategorySchema, updateCategorySchema } from './category.schema';

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>['body'];

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
