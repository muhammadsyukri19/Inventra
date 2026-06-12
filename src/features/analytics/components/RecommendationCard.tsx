'use client';

import React, { useState } from 'react';
import { Card } from '@/components/atoms/card/Card';
import { Typography } from '@/components/atoms/typography';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Sparkles,
  ChevronRight,
  TrendingDown,
  Info,
  Check,
  X,
  Clock,
  Calendar,
} from 'lucide-react';
import type { RestockRecommendation, RecommendationPriority, RecommendationStatus } from '../types/recommendation.types';

interface RecommendationCardProps {
  recommendation: RestockRecommendation;
  userRole: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isActionPending: boolean;
}

export function RecommendationCard({
  recommendation,
  userRole,
  onApprove,
  onReject,
  isActionPending,
}: RecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { id, product, currentStock, reorderPoint, safetyStock, averageDailySales, recommendedQuantity, leadTimeDays, priority, status } = recommendation;

  // Determine priority badge color
  const getPriorityVariant = (p: RecommendationPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
      default:
        return 'success';
    }
  };

  const getStatusBadge = (s: RecommendationStatus) => {
    switch (s) {
      case 'APPROVED':
        return <Badge variant="success" className="px-2 py-0.5 rounded-lg text-xs font-semibold gap-1"><Check className="h-3 w-3" />Disetujui</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" className="px-2 py-0.5 rounded-lg text-xs font-semibold gap-1"><X className="h-3 w-3" />Ditolak</Badge>;
      case 'COMPLETED':
        return <Badge variant="primary" className="px-2 py-0.5 rounded-lg text-xs font-semibold gap-1"><Clock className="h-3 w-3" />Selesai</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="default" className="px-2 py-0.5 rounded-lg text-xs font-semibold">Menunggu Review</Badge>;
    }
  };

  const ads = Number(averageDailySales);
  const daysUntilEmpty = ads > 0 ? (currentStock / ads).toFixed(1) : '∞';

  return (
    <Card className="border border-border-default hover:border-primary-100 transition-all rounded-xl p-5 overflow-hidden flex flex-col justify-between">
      {/* ── CARD HEADER ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex justify-between items-start gap-2">
          <Badge variant={getPriorityVariant(priority)} className="px-2 py-0.5 rounded text-[10px] font-bold">
            {priority} PRIORITY
          </Badge>
          {getStatusBadge(status)}
        </div>

        <div className="mt-3">
          <Typography variant="body" weight="semibold" className="text-text-primary line-clamp-1">
            {product.name}
          </Typography>
          <div className="flex gap-2 items-center mt-1">
            <Typography variant="caption" color="tertiary" className="font-mono">
              SKU: {product.sku}
            </Typography>
            <span className="h-1 w-1 rounded-full bg-border-default" />
            <Typography variant="caption" color="tertiary">
              {product.category.name}
            </Typography>
          </div>
        </div>

        {/* ── STOCK LEVEL COMPARISON ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-y border-border-default bg-surface/50 rounded-lg px-2">
          <div>
            <Typography variant="caption" color="tertiary" className="block">
              Stok Saat Ini
            </Typography>
            <Typography variant="body" weight="bold" className={currentStock === 0 ? 'text-danger-600' : 'text-text-primary'}>
              {currentStock} {product.unit}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" color="tertiary" className="block">
              Batas ROP
            </Typography>
            <Typography variant="body" weight="bold" className="text-text-primary">
              {reorderPoint} {product.unit}
            </Typography>
          </div>
        </div>

        {/* ── SUGGESTED REPLENISHMENT ──────────────────────────────────────── */}
        <div className="mt-4 flex justify-between items-center bg-indigo-50/20 border border-indigo-100/50 rounded-xl p-3">
          <div>
            <Typography variant="caption" color="tertiary" className="block">
              Rekomendasi Pesanan AI
            </Typography>
            <Typography variant="body" weight="bold" className="text-indigo-900">
              +{recommendedQuantity} {product.unit}
            </Typography>
          </div>
          <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
        </div>
      </div>

      {/* ── ACTIONS & DETAILS ─────────────────────────────────────────────── */}
      <div className="mt-5 space-y-4">
        {/* Toggle detail formula */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold"
        >
          <ChevronRight className={`h-4 w-4 transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          {showDetails ? 'Sembunyikan Formula AI' : 'Lihat Formula & Prediksi'}
        </button>

        {showDetails && (
          <div className="p-3 bg-surface border border-border-default rounded-lg text-xs space-y-2 animate-fade-in">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Rata-rata Penjualan:</span>
              <span className="font-semibold text-text-primary">{ads.toFixed(2)} unit/hari</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Lead Time Pengiriman:</span>
              <span className="font-semibold text-text-primary">{leadTimeDays} hari</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Stok Cadangan (Safety Stock):</span>
              <span className="font-semibold text-text-primary">{safetyStock} unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Batas Pesanan (Reorder Point):</span>
              <span className="font-semibold text-text-primary">{reorderPoint} unit</span>
            </div>
            <div className="pt-2 border-t border-border-default flex items-center justify-between text-[11px] font-medium text-warning-800 bg-warning-50/20 px-1 rounded">
              <span className="flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> Estimasi Habis:</span>
              <span>~{daysUntilEmpty} hari lagi</span>
            </div>
            <div className="text-[10px] text-text-tertiary italic flex items-start gap-1 mt-1 leading-normal">
              <Info className="h-3 w-3 shrink-0 text-text-quaternary mt-0.5" />
              <span>Formula ROP = (Penjualan Harian &times; Lead Time) + Safety Stock.</span>
            </div>
          </div>
        )}

        {/* Action Buttons for OWNER role when status is PENDING */}
        {status === 'PENDING' && (userRole === 'owner' || userRole === 'admin') ? (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 gap-1"
              disabled={isActionPending}
              onClick={() => onApprove(id)}
            >
              <Check className="h-4 w-4" /> Setujui
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1 gap-1"
              disabled={isActionPending}
              onClick={() => onReject(id)}
            >
              <X className="h-4 w-4" /> Tolak
            </Button>
          </div>
        ) : null}

        {/* Supplier contact person helper */}
        {product.supplier && (
          <div className="pt-3 border-t border-border-default flex items-center gap-2 text-xs text-text-tertiary">
            <Calendar className="h-3.5 w-3.5" />
            <span>Supplier: <strong className="text-text-secondary">{product.supplier.name}</strong></span>
          </div>
        )}
      </div>
    </Card>
  );
}
