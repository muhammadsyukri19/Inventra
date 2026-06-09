/**
 * Common type definitions shared across backend modules.
 */

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export type UserRole = 'admin' | 'staff_gudang' | 'owner';

export const USER_ROLES: Record<string, UserRole> = {
  ADMIN: 'admin',
  STAFF_GUDANG: 'staff_gudang',
  OWNER: 'owner',
} as const;
