/**
 * React Query cache keys for consistent cache management across the application.
 *
 * All keys are typed as `const` to enable precise cache invalidation.
 * Function-based keys accept optional `params` objects so filters and pagination
 * are automatically included in the cache key.
 *
 * @example
 * // Static key
 * useQuery({ queryKey: QUERY_KEYS.AUTH_ME })
 *
 * // Dynamic key with params
 * useQuery({ queryKey: QUERY_KEYS.PRODUCTS({ page: 1, search: 'laptop' }) })
 */
export const QUERY_KEYS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH_ME: ['auth', 'me'] as const,

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: (params?: object) => ['users', params] as const,
  USER_DETAIL: (id: string) => ['users', id] as const,

  // ── Products ──────────────────────────────────────────────────────────────
  PRODUCTS: (params?: object) => ['products', params] as const,
  PRODUCT_DETAIL: (id: string) => ['products', id] as const,

  // ── Categories ────────────────────────────────────────────────────────────
  CATEGORIES: (params?: object) => ['categories', params] as const,
  CATEGORY_DETAIL: (id: string) => ['categories', id] as const,

  // ── Suppliers ─────────────────────────────────────────────────────────────
  SUPPLIERS: (params?: object) => ['suppliers', params] as const,
  SUPPLIER_DETAIL: (id: string) => ['suppliers', id] as const,

  // ── Inventories ───────────────────────────────────────────────────────────
  INVENTORIES: (params?: object) => ['inventories', params] as const,
  INVENTORY_DETAIL: (productId: string) => ['inventories', productId] as const,

  // ── Transactions ──────────────────────────────────────────────────────────
  TRANSACTIONS: (params?: object) => ['transactions', params] as const,
  TRANSACTION_DETAIL: (id: string) => ['transactions', id] as const,

  // ── Stock Movements ───────────────────────────────────────────────────────
  STOCK_MOVEMENTS: (params?: object) => ['stock-movements', params] as const,

  // ── Analytics ─────────────────────────────────────────────────────────────
  ANALYTICS_SALES: (params?: object) => ['analytics', 'sales', params] as const,
  ANALYTICS_TOP_PRODUCTS: (params?: object) =>
    ['analytics', 'top-products', params] as const,
  ANALYTICS_STOCK_HEALTH: ['analytics', 'stock-health'] as const,

  // ── Recommendations ───────────────────────────────────────────────────────
  RECOMMENDATIONS: (params?: object) => ['recommendations', params] as const,

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: (params?: object) => ['notifications', params] as const,
  NOTIFICATIONS_UNREAD: ['notifications', 'unread-count'] as const,

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD_SUMMARY: ['dashboard', 'summary'] as const,
  DASHBOARD_SALES_CHART: (params?: object) =>
    ['dashboard', 'sales-chart', params] as const,
  DASHBOARD_STOCK_ALERTS: ['dashboard', 'stock-alerts'] as const,

  // ── Reports ───────────────────────────────────────────────────────────────
  REPORTS_INVENTORY: (params?: object) => ['reports', 'inventory', params] as const,
  REPORTS_TRANSACTIONS: (params?: object) =>
    ['reports', 'transactions', params] as const,
} as const;
