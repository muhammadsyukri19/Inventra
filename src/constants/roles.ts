import type { UserRole } from '@/types/common.types';

/**
 * Role constants and permission definitions.
 *
 * Maps user roles to their allowed navigation items and permissions.
 */

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  staff_gudang: 'Staff Gudang',
  owner: 'Pemilik',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'dashboard',
    'products',
    'categories',
    'suppliers',
    'inventory',
    'inventory-audit',
    'transactions',
    'analytics',
    'recommendations',
    'notifications',
    'users',
  ],
  staff_gudang: [
    'products',
    'categories',
    'suppliers',
    'inventory',
    'inventory-audit',
    'transactions',
    'notifications',
  ],
  owner: [
    'dashboard',
    'analytics',
    'recommendations',
    'notifications',
  ],
} as const;
