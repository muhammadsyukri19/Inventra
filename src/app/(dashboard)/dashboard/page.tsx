'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Card } from '@/components/atoms/card';
import { StatCard } from '@/components/molecules/stat-card';
import { EmptyState } from '@/components/molecules/empty-state';
import { RecommendationsPanel } from '@/components/organisms/recommendations-panel';
import {
  Package,
  Warehouse,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowLeftRight,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { SalesChart } from '@/components/molecules/sales-chart'; 
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Gunakan timestamp agar data selalu segar (anti-cache)
      const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD_SUMMARY}?t=${Date.now()}`);
      
      // Ambil data sesuai struktur response backend
      const actualData = response.data.data;
      console.log("MAPPING BERHASIL, DATA SIAP DIUI:", actualData);

      setSummary(actualData);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-end">
        <div>
          <Typography variant="h1">Dashboard</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Ringkasan inventaris dan analitik penjualan real-time
          </Typography>
        </div>
        {isLoading && <Loader2 className="animate-spin text-primary-500 mb-2" />}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Produk"
          value={String(summary?.totalProducts ?? 0)}
          icon={<Package className="h-5 w-5" />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Total Stok"
          value={String(summary?.totalStock ?? 0)}
          icon={<Warehouse className="h-5 w-5" />}
          iconBg="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Hampir Habis"
          value={String(summary?.lowStockCount ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Stok Habis"
          value={String(summary?.outOfStockCount ?? 0)}
          icon={<XCircle className="h-5 w-5" />}
          iconBg="bg-red-50 text-red-600"
        />
        <StatCard
          label="Penjualan (Bln Ini)"
          value={String(summary?.monthlySalesCount ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-green-50 text-green-600"
        />
        <StatCard
          label="Total Transaksi"
          value={String(summary?.totalTransactions ?? 0)}
          icon={<ArrowLeftRight className="h-5 w-5" />}
          iconBg="bg-cyan-50 text-cyan-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ========================================================== */}
        {/* BAGIAN GRAFIK PENJUALAN (YANG DIUBAH) */}
        {/* ========================================================== */}
        <Card padding="md" className="lg:col-span-2 bg-white border border-slate-200">
          <Typography variant="h3">Grafik Penjualan</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Tren barang masuk dan keluar 7 hari terakhir
          </Typography>
          
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
            </div>
          ) : summary?.chartData && summary.chartData.length > 0 ? (
            // JIKA DATA CHART ADA, TAMPILKAN KOMPONEN GRAFIK
            <SalesChart data={summary.chartData} />
          ) : (
            // JIKA KOSONG, TAMPILKAN EMPTY STATE
            <EmptyState
              icon={<BarChart3 className="h-12 w-12 text-slate-200" />}
              title="Belum ada data tren"
              description="Data grafik akan muncul setelah ada transaksi dalam 7 hari terakhir"
              className="mt-6"
            />
          )}
        </Card>
        {/* ========================================================== */}

        {/* Stock alerts */}
        <Card padding="md" className="bg-white border border-slate-200">
          <Typography variant="h3">Peringatan Stok</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Produk yang perlu diperhatikan
          </Typography>
          
          {summary?.lowStockCount > 0 ? (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 text-orange-800 animate-in fade-in duration-500">
              <AlertTriangle className="text-orange-500 w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Ada <strong>{summary.lowStockCount}</strong> produk yang stoknya hampir habis! Segera lakukan restock.
              </span>
            </div>
          ) : (
            <EmptyState
              icon={<AlertTriangle className="h-12 w-12 text-slate-100" />}
              title="Aman"
              description="Semua stok dalam kondisi aman"
              className="mt-6"
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md" className="bg-white border border-slate-200">
          <Typography variant="h3">Produk Terlaris</Typography>
          <EmptyState
            icon={<TrendingUp className="h-12 w-12 text-slate-100" />}
            title="Belum ada data"
            description="Daftar produk terlaris akan muncul otomatis"
            className="mt-4"
          />
        </Card>

        <Card padding="md" className="bg-white border border-slate-200">
          <Typography variant="h3">Rekomendasi Restock AI</Typography>
          <RecommendationsPanel data={summary?.recommendations} />
        </Card>
      </div>
    </div>
  );
}