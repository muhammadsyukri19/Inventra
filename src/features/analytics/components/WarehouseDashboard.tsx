'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/atoms/card/Card';
import { Typography } from '@/components/atoms/typography';
import { Badge } from '@/components/atoms/badge';
import {
  Boxes,
  AlertOctagon,
  ShieldAlert,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import type { StaffAnalytics } from '../types/analytics.types';

interface WarehouseDashboardProps {
  data: StaffAnalytics;
}

export function WarehouseDashboard({ data }: WarehouseDashboardProps) {
  // Defensive check during role transitions
  if (!data || !data.movementChartData) {
    return null;
  }

  const { metrics, movementChartData, topMovingProducts } = data;

  return (
    <div className="space-y-6">

      {/* ── METRICS GRID ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Volume Barang */}
        <Card className="p-5 border border-border-default hover:border-primary-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Total Kuantitas Barang
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.totalItems.toLocaleString('id-ID')}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Jumlah kumulatif seluruh unit stok
          </Typography>
        </Card>

        {/* Metric 2: ROP Breach Rate */}
        <Card className="p-5 border border-border-default hover:border-danger-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Rasio Kritis ROP
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.ropBreachRate}%
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-danger-50 text-danger-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            SKU di bawah Reorder Point
          </Typography>
        </Card>

        {/* Metric 3: Stok Menipis */}
        <Card className="p-5 border border-border-default hover:border-warning-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Stok Menipis (Warning)
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.lowStockCount}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-warning-50 text-warning-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Perlu pemesanan restock segera
          </Typography>
        </Card>

        {/* Metric 4: Stok Habis */}
        <Card className="p-5 border border-border-default hover:border-danger-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Stok Habis (Kosong)
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.outOfStockCount}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-danger-50 text-danger-600">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Stok bernilai nol / kosong di rak
          </Typography>
        </Card>
      </div>

      {/* ── CHART & TOP PRODUCTS SECTION ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart: Inbound vs Outbound */}
        <Card className="lg:col-span-2 p-5 border border-border-default rounded-xl">
          <div className="mb-4">
            <Typography variant="body" weight="semibold">
              Volume Arus Pergerakan Barang (7 Hari Terakhir)
            </Typography>
            <Typography variant="caption" color="tertiary" className="mt-0.5">
              Statistik perbandingan jumlah total unit barang Masuk (Inbound) vs Keluar (Outbound).
            </Typography>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-default, #e5e7eb)" />
                <XAxis dataKey="name" fontSize={11} stroke="var(--color-text-tertiary, #9ca3af)" />
                <YAxis fontSize={11} stroke="var(--color-text-tertiary, #9ca3af)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    borderColor: 'var(--color-border-default, #e5e7eb)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend verticalAlign="top" height={36} fontSize={11} />
                <Bar dataKey="masuk" name="Barang Masuk (Inbound)" fill="var(--color-success-500, #10b981)" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="keluar" name="Barang Keluar (Outbound)" fill="var(--color-primary-500, #3b82f6)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* List: Top Moving Products */}
        <Card className="p-5 border border-border-default rounded-xl">
          <div className="mb-4">
            <Typography variant="body" weight="semibold">
              Produk Teraktif (Fast Moving)
            </Typography>
            <Typography variant="caption" color="tertiary" className="mt-0.5">
              Produk dengan volume aktivitas mutasi tertinggi minggu ini.
            </Typography>
          </div>

          <div className="space-y-4">
            {topMovingProducts.length === 0 ? (
              <div className="py-12 text-center">
                <Typography variant="body-sm" color="tertiary">Tidak ada pergerakan barang minggu ini</Typography>
              </div>
            ) : (
              topMovingProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-border-default last:border-b-0 last:pb-0">
                  <div className="min-w-0 pr-2">
                    <Typography variant="body-sm" weight="semibold" className="truncate text-text-primary">
                      {p.name}
                    </Typography>
                    <Typography variant="caption" color="tertiary" className="font-mono">
                      {p.sku}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center text-xs font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded gap-0.5">
                      <ArrowDownCircle className="h-3 w-3" />
                      {p.inbound}
                    </span>
                    <span className="flex items-center text-xs font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded gap-0.5">
                      <ArrowUpCircle className="h-3 w-3" />
                      {p.outbound}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
