export interface OwnerMetrics {
  totalProducts: number;
  totalAssetValue: number;
  totalRetailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  modelConfidence: number;
}

export interface CategoryData {
  name: string;
  stock: number;
  value: number;
}

export interface ForecastingPoint {
  name: string;
  actualSales?: number;
  modeledSales?: number;
  forecastedSales?: number;
}

export interface ForecastingData {
  history: ForecastingPoint[];
  forecast: ForecastingPoint[];
  equation: string;
}

export interface OwnerAnalytics {
  metrics: OwnerMetrics;
  categoryData: CategoryData[];
  forecasting: ForecastingData;
}

export interface StaffMetrics {
  totalItems: number;
  outOfStockCount: number;
  lowStockCount: number;
  ropBreachRate: number;
  activeSkus: number;
}

export interface MovementChartPoint {
  name: string;
  masuk: number;
  keluar: number;
}

export interface TopMovingProduct {
  name: string;
  sku: string;
  inbound: number;
  outbound: number;
  totalVolume: number;
}

export interface StaffAnalytics {
  metrics: StaffMetrics;
  movementChartData: MovementChartPoint[];
  topMovingProducts: TopMovingProduct[];
}

export interface AdminMetrics {
  totalUsers: number;
  pendingUsers: number;
  totalTransactions: number;
}

export interface UserStatusPoint {
  name: string;
  count: number;
}

export interface UserActivityPoint {
  name: string;
  role: string;
  count: number;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  code: string;
  amount: number;
}

export interface AdminAnalytics {
  metrics: AdminMetrics;
  userStatusData: UserStatusPoint[];
  userActivity: UserActivityPoint[];
  logs: AdminLog[];
}
