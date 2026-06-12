export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RecommendationProduct {
  id: string;
  sku: string;
  name: string;
  unit: string;
  price: string | number;
  category: {
    name: string;
  };
  supplier?: {
    name: string;
    contactPerson?: string;
  } | null;
}

export interface RestockRecommendation {
  id: string;
  productId: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  averageDailySales: string | number;
  recommendedQuantity: number;
  leadTimeDays: number;
  status: RecommendationStatus;
  priority: RecommendationPriority;
  createdAt: string;
  updatedAt: string;
  product: RecommendationProduct;
}
