/**
 * Application route constants.
 *
 * Centralized route definitions to avoid hardcoded paths throughout the app.
 */

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_CREATE: '/products/create',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CATEGORIES: '/categories',
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAIL: (id: string) => `/suppliers/${id}`,
  INVENTORY: '/inventory',
  TRANSACTIONS: '/transactions',
  TRANSACTION_IN: '/transactions/in',
  TRANSACTION_OUT: '/transactions/out',
  ANALYTICS: '/analytics',
  RECOMMENDATIONS: '/recommendations',
  NOTIFICATIONS: '/notifications',
  USERS: '/users',
} as const;
