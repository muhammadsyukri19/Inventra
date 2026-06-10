/**
 * API endpoint constants.
 *
 * Centralized endpoint definitions for all backend API calls.
 * Never hardcode API URLs directly in services or components.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: `${BASE_URL}/auth/register`,
  AUTH_LOGIN: `${BASE_URL}/auth/login`,
  AUTH_REFRESH: `${BASE_URL}/auth/refresh`,
  AUTH_LOGOUT: `${BASE_URL}/auth/logout`,
  AUTH_ME: `${BASE_URL}/auth/me`,

  // Users
  USERS: `${BASE_URL}/users`,
  USER_DETAIL: (id: string) => `${BASE_URL}/users/${id}`,

  // Products
  PRODUCTS: `${BASE_URL}/products`,
  PRODUCT_DETAIL: (id: string) => `${BASE_URL}/products/${id}`,
  PRODUCT_VALIDATE: (code: string) => `${BASE_URL}/products/validate/${code}`,

  // Categories
  CATEGORIES: `${BASE_URL}/categories`,
  CATEGORY_DETAIL: (id: string) => `${BASE_URL}/categories/${id}`,

  // Suppliers
  SUPPLIERS: `${BASE_URL}/suppliers`,
  SUPPLIER_DETAIL: (id: string) => `${BASE_URL}/suppliers/${id}`,

  // Inventory
  INVENTORIES: `${BASE_URL}/inventories`,
  INVENTORY_DETAIL: (productId: string) => `${BASE_URL}/inventories/${productId}`,
  INVENTORY_ADJUST: (productId: string) => `${BASE_URL}/inventories/${productId}/adjust`,

  // Transactions
  TRANSACTIONS: `${BASE_URL}/transactions`,
  TRANSACTION_DETAIL: (id: string) => `${BASE_URL}/transactions/${id}`,
  TRANSACTION_IN: `${BASE_URL}/transactions/in`,
  TRANSACTION_OUT: `${BASE_URL}/transactions/out`,

  // Stock Movements
  STOCK_MOVEMENTS: `${BASE_URL}/stock-movements`,
  STOCK_MOVEMENTS_BY_PRODUCT: (productId: string) =>
    `${BASE_URL}/stock-movements/product/${productId}`,

  // Analytics
  ANALYTICS_SALES_SUMMARY: `${BASE_URL}/analytics/sales-summary`,
  ANALYTICS_SALES_CHART: `${BASE_URL}/analytics/sales-chart`,
  ANALYTICS_TOP_PRODUCTS: `${BASE_URL}/analytics/top-products`,
  ANALYTICS_REORDER_POINTS: `${BASE_URL}/analytics/reorder-points`,

  // Recommendations
  RECOMMENDATIONS: `${BASE_URL}/recommendations`,
  RECOMMENDATION_DETAIL: (id: string) => `${BASE_URL}/recommendations/${id}`,
  RECOMMENDATION_GENERATE: `${BASE_URL}/recommendations/generate`,
  RECOMMENDATION_STATUS: (id: string) => `${BASE_URL}/recommendations/${id}/status`,

  // Notifications
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  NOTIFICATIONS_UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`,
  NOTIFICATION_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${BASE_URL}/notifications/read-all`,

  // Dashboard
  DASHBOARD_SUMMARY: `${BASE_URL}/dashboard/summary`,
  DASHBOARD_STOCK_ALERTS: `${BASE_URL}/dashboard/stock-alerts`,
} as const;
