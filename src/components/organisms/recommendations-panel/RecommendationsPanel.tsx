'use client';

import React, { useEffect, useState } from 'react';
import { Typography } from '../../atoms/typography';
import { Button } from '../../atoms/button';
import { EmptyState } from '../../molecules/empty-state';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import apiClient from '@/services/api-client';

export const RecommendationsPanel = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/v1/recommendations');
      setRecommendations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<RefreshCw className={`h-12 w-12 ${isLoading ? 'animate-spin' : ''}`} />}
        title="Belum ada rekomendasi"
        description="AI belum menemukan produk yang perlu di-restock saat ini."
        className="mt-4"
      />
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
         <Button variant="secondary" size="sm" onClick={fetchRecommendations} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
         </Button>
      </div>
      <ul className="space-y-3">
        {recommendations.slice(0, 5).map((rec) => (
          <li key={rec.id} className="p-3 bg-surface border border-default rounded-lg flex items-center justify-between">
            <div>
              <Typography variant="body" className="font-semibold">{rec.product.name}</Typography>
              <Typography variant="body-sm" color="secondary">
                Stok: {rec.currentStock} | Rekomendasi Pesan: {rec.recommendedQuantity}
              </Typography>
            </div>
            {rec.priority === 'CRITICAL' ? (
               <AlertTriangle className="text-danger h-5 w-5" />
            ) : (
               <RefreshCw className="text-warning h-5 w-5" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
