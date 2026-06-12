import { z } from 'zod';
import { createUserSchema, updateUserSchema } from './user.schema';

export type CreateUserPayload = z.infer<typeof createUserSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  username: string;
  status: string;
  role: {
    id: string;
    name: string;
  };
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
