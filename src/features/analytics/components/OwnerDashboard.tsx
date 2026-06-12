'use client';

import React from 'react';
import {
  AreaChart,
  Area,
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
  TrendingUp,
  DollarSign,
  PackageCheck,
  Percent,
  Sparkles,
} from 'lucide-react';
import type { OwnerAnalytics } from '../types/analytics.types';

interface OwnerDashboardProps {
  data: OwnerAnalytics;
}

export function OwnerDashboard({ data }: OwnerDashboardProps) {
  // Defensive check during role transitions
  if (!data || !data.forecasting) {
    return null;
  }

  const { metrics, categoryData, forecasting } = data;

  // Format currency in Rupiah (IDR)
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Combine history and forecast data for the chart visualization
  // Chronological representation of 30 days of history followed by 7 days of forecast
  const chartData = [
    ...forecasting.history.map((pt) => ({
      name: pt.name,
      'Penjualan Historis': pt.actualSales,
      'Model Tren AI': pt.modeledSales,
      'Prediksi Penjualan': null,
    })),
    ...forecasting.forecast.map((pt) => ({
      name: pt.name,
      'Penjualan Historis': null,
      'Model Tren AI': null,
      'Prediksi Penjualan': pt.forecastedSales,
    })),
  ];

  const profitPotential = Math.max(0, metrics.totalRetailValue - metrics.totalAssetValue);

  return (
    <div className="space-y-6">
      {/* ── SECTION HEADER ─────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Badge variant="success" className="h-8 gap-1.5 px-3 rounded-lg text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-success-600" />
          AI Model Active
        </Badge>
      </div>

      {/* ── METRICS GRID ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Nilai Modal Aset */}
        <Card className="p-5 border border-border-default hover:border-primary-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Nilai Modal Aset
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {formatIDR(metrics.totalAssetValue)}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Berdasarkan Harga Beli (Cost Price)
          </Typography>
        </Card>

        {/* Metric 2: Nilai Jual Aset */}
        <Card className="p-5 border border-border-default hover:border-success-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Estimasi Nilai Jual
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {formatIDR(metrics.totalRetailValue)}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-success-50 text-success-600">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Potensi Pendapatan Aset Aktif
          </Typography>
        </Card>

        {/* Metric 3: Prospek Keuntungan */}
        <Card className="p-5 border border-border-default hover:border-warning-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Potensi Margin Keuntungan
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {formatIDR(profitPotential)}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-warning-50 text-warning-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Selisih Nilai Jual & Modal Beli
          </Typography>
        </Card>

        {/* Metric 4: Kepercayaan Model ML */}
        <Card className="p-5 border border-border-default hover:border-indigo-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Akurasi Model Prediksi
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {(metrics.modelConfidence * 100).toFixed(0)}%
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Tingkat Kepercayaan Regresi Linier
          </Typography>
        </Card>
      </div>

      {/* ── CHARTS SECTION ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: ML Sales Forecasting (Wide) */}
        <Card className="lg:col-span-2 p-5 border border-border-default rounded-xl">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <Typography variant="body" weight="semibold">
                Peramalan Tren Penjualan Harian (AI Predictive)
              </Typography>
              <Typography variant="caption" color="tertiary" className="mt-0.5">
                Membandingkan data historis 30 hari vs. prediksi tren 7 hari ke depan.
              </Typography>
            </div>
            <Badge variant="info" className="h-6 rounded text-[10px] font-mono shrink-0">
              Persamaan: {forecasting.equation}
            </Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500, #3b82f6)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-primary-500, #3b82f6)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-indigo-500, #6366f1)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-indigo-500, #6366f1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="Penjualan Historis" 
                  stroke="var(--color-primary-500, #3b82f6)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Prediksi Penjualan" 
                  stroke="var(--color-indigo-500, #6366f1)" 
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorForecast)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Category distribution (Narrow) */}
        <Card className="p-5 border border-border-default rounded-xl">
          <div className="mb-4">
            <Typography variant="body" weight="semibold">
              Distribusi Aset per Kategori
            </Typography>
            <Typography variant="caption" color="tertiary" className="mt-0.5">
              Nilai jual total produk di setiap kategori.
            </Typography>
          </div>

          <div className="h-72 w-full">
            {categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Typography variant="body-sm" color="tertiary">Tidak ada data Kategori</Typography>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-default, #e5e7eb)" />
                  <XAxis type="number" fontSize={11} stroke="var(--color-text-tertiary, #9ca3af)" />
                  <YAxis dataKey="name" type="category" fontSize={11} width={80} stroke="var(--color-text-tertiary, #9ca3af)" />
                  <Tooltip
                    formatter={(value) => formatIDR(value as number)}
                    contentStyle={{
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      borderColor: 'var(--color-border-default, #e5e7eb)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="var(--color-warning-500, #f59e0b)" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
