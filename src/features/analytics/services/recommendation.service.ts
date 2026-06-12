import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { RestockRecommendation, RecommendationStatus } from '../types/recommendation.types';

export const recommendationService = {
  getRecommendations: async (): Promise<RestockRecommendation[]> => {
    const { data } = await apiClient.get<any>(API_ENDPOINTS.RECOMMENDATIONS);
    // data.data is { success: true, data: [...] }
    return data.data?.data || data.data || [];
  },

  triggerPrediction: async (): Promise<{ success: boolean; generatedCount: number }> => {
    const { data } = await apiClient.post<any>(`${API_ENDPOINTS.RECOMMENDATIONS}/trigger`);
    return data.data?.data || data.data;
  },

  updateStatus: async (id: string, status: RecommendationStatus): Promise<RestockRecommendation> => {
    const { data } = await apiClient.patch<any>(
      API_ENDPOINTS.RECOMMENDATIONS_STATUS(id),
      { status }
    );
    return data.data?.data || data.data;
  },
};
