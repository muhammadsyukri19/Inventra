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
      
      // Ambil data dari server
      const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD_SUMMARY}?t=${Date.now()}`);
      
      // PERBAIKAN PATH:
      // Kita harus mengambil response.data.data karena backend membungkusnya dua kali
      const actualData = response.data.data;

      console.log("MAPPING BERHASIL, DATA SIAP DIUI:", actualData);

      // Masukkan data (1, 2, dll) ke dalam state summary
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

      {/* Summary cards dengan DATA ASLI */}
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
        {/* Sales chart */}
        <Card padding="md" className="lg:col-span-2 bg-white">
          <Typography variant="h3">Grafik Penjualan</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Data penjualan 6 bulan terakhir
          </Typography>
          <EmptyState
            icon={<BarChart3 className="h-12 w-12 text-slate-300" />}
            title="Belum ada data grafik"
            description="Fitur visualisasi sedang dalam pengembangan"
            className="mt-6"
          />
        </Card>

        {/* Stock alerts */}
        <Card padding="md" className="bg-white">
          <Typography variant="h3">Peringatan Stok</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Produk yang perlu diperhatikan
          </Typography>
          
          {(summary?.lowStockCount > 0) ? (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="text-orange-500" />
              <span className="text-sm font-medium text-orange-800">
                Ada {summary.lowStockCount} produk yang hampir habis!
              </span>
            </div>
          ) : (
            <EmptyState
              icon={<AlertTriangle className="h-12 w-12 text-slate-200" />}
              title="Aman"
              description="Semua stok dalam kondisi aman"
              className="mt-6"
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md" className="bg-white">
          <Typography variant="h3">Produk Terlaris</Typography>
          <EmptyState
            icon={<TrendingUp className="h-12 w-12 text-slate-200" />}
            title="Belum ada data"
            description="Daftar produk terlaris akan muncul setelah transaksi penjualan"
            className="mt-4"
          />
        </Card>

        <Card padding="md" className="bg-white">
          <Typography variant="h3">Rekomendasi Restock AI</Typography>
          <RecommendationsPanel />
        </Card>
      </div>
    </div>
  );
}