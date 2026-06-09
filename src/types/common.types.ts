/**
 * Common type definitions shared across frontend features.
 */

export type UserRole = 'admin' | 'staff_gudang' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export type NotificationType = 'STOCK_CRITICAL' | 'STOCK_EMPTY' | 'RESTOCK_RECOMMENDATION';
export type TransactionType = 'IN' | 'OUT';
export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
