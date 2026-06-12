/**
 * API endpoint constants.
 *
 * Centralized endpoint definitions for all backend API calls.
 * Never hardcode API URLs directly in services or components.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH_REGISTER: `${BASE_URL}/auth/register`,
  AUTH_LOGIN: `${BASE_URL}/auth/login`,
  AUTH_REFRESH: `${BASE_URL}/auth/refresh`,
  AUTH_LOGOUT: `${BASE_URL}/auth/logout`,
  AUTH_ME: `${BASE_URL}/auth/me`,
  AUTH_CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: `${BASE_URL}/users`,
  USER_DETAIL: (id: string) => `${BASE_URL}/users/${id}`,
  USER_APPROVE: (id: string) => `${BASE_URL}/users/${id}/approve`,
  USER_REJECT: (id: string) => `${BASE_URL}/users/${id}/reject`,
  USER_DEACTIVATE: (id: string) => `${BASE_URL}/users/${id}/deactivate`,

  // ── Products ──────────────────────────────────────────────────────────────
  PRODUCTS: `${BASE_URL}/products`,
  PRODUCT_DETAIL: (id: string) => `${BASE_URL}/products/${id}`,
  PRODUCT_TOGGLE_ACTIVE: (id: string) => `${BASE_URL}/products/${id}/toggle-active`,
  PRODUCTS_SCAN: `${BASE_URL}/products/scan`,
  PRODUCT_VALIDATE: (code: string) => `${BASE_URL}/products/validate/${code}`,

  // ── Categories ────────────────────────────────────────────────────────────
  CATEGORIES: `${BASE_URL}/categories`,
  CATEGORY_DETAIL: (id: string) => `${BASE_URL}/categories/${id}`,

  // ── Suppliers ─────────────────────────────────────────────────────────────
  SUPPLIERS: `${BASE_URL}/suppliers`,
  SUPPLIER_DETAIL: (id: string) => `${BASE_URL}/suppliers/${id}`,
  SUPPLIER_TOGGLE_ACTIVE: (id: string) => `${BASE_URL}/suppliers/${id}/toggle-active`,

  // ── Inventory ─────────────────────────────────────────────────────────────
  INVENTORIES: `${BASE_URL}/inventories`,
  INVENTORY_DETAIL: (productId: string) => `${BASE_URL}/inventories/${productId}`,
  INVENTORY_ADJUST: (productId: string) =>
    `${BASE_URL}/inventories/${productId}/adjust`,
  INVENTORY_SETTINGS: (productId: string) =>
    `${BASE_URL}/inventories/${productId}/settings`,

  // ── Transactions ──────────────────────────────────────────────────────────
  TRANSACTIONS: `${BASE_URL}/transactions`,
  TRANSACTION_DETAIL: (id: string) => `${BASE_URL}/transactions/${id}`,
  TRANSACTION_IN: `${BASE_URL}/transactions/in`,
  TRANSACTION_OUT: `${BASE_URL}/transactions/out`,

  // ── Stock Movements ───────────────────────────────────────────────────────
  STOCK_MOVEMENTS: `${BASE_URL}/stock-movements`,
  STOCK_MOVEMENTS_BY_PRODUCT: (productId: string) =>
    `${BASE_URL}/stock-movements/product/${productId}`,

  // ── Analytics ─────────────────────────────────────────────────────────────
  ANALYTICS_SALES: `${BASE_URL}/analytics/sales`,
  ANALYTICS_TOP_PRODUCTS: `${BASE_URL}/analytics/top-products`,
  ANALYTICS_STOCK_HEALTH: `${BASE_URL}/analytics/stock-health`,
  ANALYTICS_DASHBOARD_ROLE: `${BASE_URL}/analytics/dashboard-role`,
  ANALYTICS_DASHBOARD_OWNER: `${BASE_URL}/analytics/dashboard/owner`,
  ANALYTICS_DASHBOARD_STAFF: `${BASE_URL}/analytics/dashboard/staff`,
  ANALYTICS_DASHBOARD_ADMIN: `${BASE_URL}/analytics/dashboard/admin`,

  /** @deprecated Use ANALYTICS_SALES instead */
  ANALYTICS_SALES_SUMMARY: `${BASE_URL}/analytics/sales-summary`,
  /** @deprecated Use ANALYTICS_SALES instead */
  ANALYTICS_SALES_CHART: `${BASE_URL}/analytics/sales-chart`,
  ANALYTICS_REORDER_POINTS: `${BASE_URL}/analytics/reorder-points`,

  // ── Recommendations ───────────────────────────────────────────────────────
  RECOMMENDATIONS: `${BASE_URL}/recommendations`,
  RECOMMENDATION_DETAIL: (id: string) => `${BASE_URL}/recommendations/${id}`,
  RECOMMENDATION_GENERATE: `${BASE_URL}/recommendations/generate`,
  RECOMMENDATIONS_STATUS: (id: string) => `${BASE_URL}/recommendations/${id}/status`,

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  NOTIFICATIONS_UNREAD: `${BASE_URL}/notifications/unread-count`,
  NOTIFICATIONS_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${BASE_URL}/notifications/read-all`,
  /** @deprecated Use NOTIFICATIONS_UNREAD instead */
  NOTIFICATIONS_UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`,
  /** @deprecated Use NOTIFICATIONS_READ instead */
  NOTIFICATION_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_SUMMARY: `${BASE_URL}/dashboard/summary`,
  DASHBOARD_SALES_CHART: `${BASE_URL}/dashboard/sales-chart`,
  DASHBOARD_STOCK_ALERTS: `${BASE_URL}/dashboard/stock-alerts`,

  // ── Reports ───────────────────────────────────────────────────────────────
  REPORTS_INVENTORY: `${BASE_URL}/reports/inventory`,
  REPORTS_TRANSACTIONS: `${BASE_URL}/reports/transactions`,
} as const;
