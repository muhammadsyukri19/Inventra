/**
 * Application route constants.
 *
 * Centralized route definitions to avoid hardcoded paths throughout the app.
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_CREATE: '/products/create',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_EDIT: (id: string) => `/products/${id}/edit`,
  CATEGORIES: '/categories',
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAIL: (id: string) => `/suppliers/${id}`,
  INVENTORY: '/inventory',
  TRANSACTIONS: '/transactions',
  TRANSACTION_CREATE: '/transactions/create',
  TRANSACTION_DETAIL: (id: string) => `/transactions/${id}`,
  TRANSACTION_IN: '/transactions/in',
  TRANSACTION_OUT: '/transactions/out',
  ANALYTICS: '/analytics',
  RECOMMENDATIONS: '/recommendations',
  NOTIFICATIONS: '/notifications',
  USERS: '/users',
} as const;
