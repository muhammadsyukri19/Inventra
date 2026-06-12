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
      const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD_SUMMARY}?t=${Date.now()}`);
      const actualData = response.data.data;
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
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <Typography variant="h1" className="text-slate-900 font-bold">Dashboard</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Ringkasan inventaris dan analitik penjualan real-time
          </Typography>
        </div>
        {isLoading && <Loader2 className="animate-spin text-primary-500 mb-2" />}
      </div>

      {/* 1. SUMMARY CARDS SECTION */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Produk" value={String(summary?.totalProducts ?? 0)} icon={<Package className="h-5 w-5" />} iconBg="bg-blue-100 text-blue-600" />
        <StatCard label="Total Stok" value={String(summary?.totalStock ?? 0)} icon={<Warehouse className="h-5 w-5" />} iconBg="bg-indigo-100 text-indigo-600" />
        <StatCard label="Hampir Habis" value={String(summary?.lowStockCount ?? 0)} icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-yellow-50 text-yellow-600" />
        <StatCard label="Stok Habis" value={String(summary?.outOfStockCount ?? 0)} icon={<XCircle className="h-5 w-5" />} iconBg="bg-red-50 text-red-600" />
        <StatCard label="Penjualan (Bln Ini)" value={String(summary?.monthlySalesCount ?? 0)} icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-green-50 text-green-600" />
        <StatCard label="Total Transaksi" value={String(summary?.totalTransactions ?? 0)} icon={<ArrowLeftRight className="h-5 w-5" />} iconBg="bg-cyan-50 text-cyan-600" />
      </div>

      {/* 2. MIDDLE SECTION (CHART & ALERTS) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="md" className="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800 font-bold">Grafik Penjualan</Typography>
          <Typography variant="body" color="secondary" className="mb-4">Tren barang masuk dan keluar 7 hari terakhir</Typography>
          {summary?.chartData && summary.chartData.length > 0 ? (
            <SalesChart data={summary.chartData} />
          ) : (
            <EmptyState icon={<BarChart3 className="h-12 w-12 text-slate-200" />} title="Belum ada data tren" description="Data akan muncul setelah ada transaksi harian" className="mt-6" />
          )}
        </Card>

        <Card padding="md" className="bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800 font-bold">Peringatan Stok</Typography>
          <Typography variant="body" color="secondary" className="mb-4">Produk yang perlu diperhatikan segera</Typography>
          {summary?.lowStockCount > 0 ? (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 text-orange-800">
              <AlertTriangle className="text-orange-500 w-5 h-5 mt-0.5" />
              <span className="text-sm font-medium">Ada <strong>{summary.lowStockCount}</strong> produk yang stoknya hampir habis!</span>
            </div>
          ) : (
            <EmptyState icon={<AlertTriangle className="h-12 w-12 text-slate-100" />} title="Kondisi Aman" description="Semua stok saat ini tercukupi" className="mt-6" />
          )}
        </Card>
      </div>

      {/* 3. BOTTOM SECTION (TOP PRODUCTS & AI RECOMMENDATIONS) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card Produk Terlaris */}
        <Card padding="md" className="bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800 font-bold">Produk Terlaris</Typography>
          <Typography variant="body" color="secondary" className="mb-4">Peringkat produk berdasarkan jumlah terjual</Typography>
          {summary?.topProducts && summary.topProducts.length > 0 ? (
            <div className="space-y-3">
              {summary.topProducts.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                      {index + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-800 uppercase">{item.name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{item.totalSold} Terjual</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<TrendingUp className="h-12 w-12 text-slate-100" />} title="Belum ada data" description="Lakukan transaksi keluar untuk melihat peringkat" className="mt-4" />
          )}
        </Card>

        {/* Card Rekomendasi Restock AI */}
        <Card padding="md" className="bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800 font-bold">Rekomendasi Restock AI</Typography>
          <Typography variant="body" color="secondary" className="mb-4">Analisis kebutuhan stok otomatis berbasis data</Typography>
          <RecommendationsPanel data={summary?.recommendations} />
        </Card>
      </div>
    </div>
  );
}