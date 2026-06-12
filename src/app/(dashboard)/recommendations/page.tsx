'use client';

import React from 'react';
import { Typography } from '@/components/atoms/typography';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import {
  useRecommendations,
  useTriggerPrediction,
  useUpdateRecommendationStatus,
} from '@/features/analytics/hooks/useRecommendations';
import { RecommendationList } from '@/features/analytics/components/RecommendationList';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card/Card';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function Page() {
  const { user } = useAuthStore();
  const userRole = user?.role || 'staff_gudang';

  // React Query Hooks
  const { data: recommendations = [], isLoading, isError, error } = useRecommendations();
  const triggerMutation = useTriggerPrediction();
  const updateStatusMutation = useUpdateRecommendationStatus();

  // Action handlers
  const handleTriggerPrediction = async () => {
    try {
      const res = await triggerMutation.mutateAsync();
      alert(`Kalkulasi selesai! Menghasilkan ${res.generatedCount} rekomendasi.`);
    } catch (err: any) {
      console.error(err);
      alert(`Gagal memicu peramalan AI: ${err.message}`);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'APPROVED' });
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menyetujui rekomendasi: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'REJECTED' });
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menolak rekomendasi: ${err.message}`);
    }
  };

  const isPending = triggerMutation.isPending || updateStatusMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <Typography variant="h1">Rekomendasi Restock AI</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Sistem Pendukung Keputusan (DSS) peramalan stok berbasis rata-rata pergerakan harian.
          </Typography>
        </div>

        {/* Admin trigger button */}
        {userRole === 'admin' && (
          <Button
            variant="primary"
            size="md"
            className="gap-2 shrink-0 rounded-lg shadow-sm"
            onClick={handleTriggerPrediction}
            disabled={isPending || isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${triggerMutation.isPending ? 'animate-spin' : ''}`} />
            Picu Kalkulasi AI
          </Button>
        )}
      </div>

      {/* ── LOADING STATE ─────────────────────────────────────────────────── */}
      {isLoading && (
        <Card className="flex flex-col items-center justify-center py-20 border border-border-default rounded-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <Typography variant="body-sm" color="tertiary" className="mt-4 animate-pulse text-indigo-700">
            Mengambil data rekomendasi restock AI...
          </Typography>
        </Card>
      )}

      {/* ── ERROR STATE ──────────────────────────────────────────────────── */}
      {isError && (
        <Card className="p-6 border border-danger-200 bg-danger-50/20 rounded-xl flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <Typography variant="body" weight="semibold" className="text-danger-800">
              Gagal Memuat Rekomendasi
            </Typography>
            <Typography variant="body-sm" className="text-danger-700 mt-1">
              {(error as any)?.response?.data?.message || error?.message || 'Terjadi kesalahan sistem saat memuat rekomendasi.'}
            </Typography>
          </div>
        </Card>
      )}

      {/* ── MAIN RECOMMENDATIONS LIST ────────────────────────────────────── */}
      {!isLoading && !isError && (
        <RecommendationList
          data={recommendations}
          userRole={userRole}
          onApprove={handleApprove}
          onReject={handleReject}
          isActionPending={isPending}
        />
      )}
    </div>
  );
}
