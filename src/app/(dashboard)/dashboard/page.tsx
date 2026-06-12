'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button'; // Import yang tadi ketinggalan
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
  FileDown, 
} from 'lucide-react';
import { SalesChart } from '@/components/molecules/sales-chart'; 
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { exportDashboardPDF } from '@/utils/exportReport';

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
      setSummary(response.data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const safeVal = (val: any): string => {
    if (val === null || val === undefined) return "0";
    const num = Number(val);
    return isNaN(num) ? "0" : String(num);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6 text-slate-900">
      
      {/* HEADER SECTION DENGAN TOMBOL EKSPOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <Typography variant="h1" className="text-slate-900 font-bold">Dashboard</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Ringkasan inventaris dan analitik penjualan real-time
          </Typography>
        </div>

        <Button 
          variant="ghost" 
          className="flex gap-2 items-center border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-6 font-bold"
          onClick={() => exportDashboardPDF(summary)}
          disabled={!summary || isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <FileDown className="h-5 w-5 text-primary-600" />
          )}
          Ekspor Laporan PDF
        </Button>
      </div>

      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Produk" value={safeVal(summary?.totalProducts)} icon={<Package className="h-5 w-5" />} iconBg="bg-blue-100 text-blue-600" />
        <StatCard label="Total Stok" value={safeVal(summary?.totalStock)} icon={<Warehouse className="h-5 w-5" />} iconBg="bg-indigo-100 text-indigo-600" />
        <StatCard label="Hampir Habis" value={safeVal(summary?.lowStockCount)} icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-yellow-50 text-yellow-600" />
        <StatCard label="Stok Habis" value={safeVal(summary?.outOfStockCount)} icon={<XCircle className="h-5 w-5" />} iconBg="bg-red-50 text-red-600" />
        <StatCard label="Penjualan" value={safeVal(summary?.monthlySalesCount)} icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-green-50 text-green-600" />
        <StatCard label="Transaksi" value={safeVal(summary?.totalTransactions)} icon={<ArrowLeftRight className="h-5 w-5" />} iconBg="bg-cyan-50 text-cyan-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 2. SALES CHART */}
        <Card padding="md" className="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800">Grafik Penjualan</Typography>
          {summary?.chartData?.length > 0 ? (
            <SalesChart data={summary.chartData} />
          ) : (
            <EmptyState icon={<BarChart3 className="h-12 w-12 text-slate-200" />} title="Belum ada data" description="Data akan muncul setelah ada transaksi harian" className="mt-6" />
          )}
        </Card>

        {/* 3. PERINGATAN STOK */}
        <Card padding="md" className="bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800">Peringatan Stok</Typography>
          {Number(summary?.lowStockCount) > 0 ? (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 text-orange-800">
              <AlertTriangle className="text-orange-500 w-5 h-5 mt-0.5" />
              <span className="text-sm font-medium">
                Ada <strong>{safeVal(summary?.lowStockCount)}</strong> produk yang stoknya hampir habis!
              </span>
            </div>
          ) : (
            <EmptyState icon={<AlertTriangle className="h-12 w-12 text-slate-100" />} title="Kondisi Aman" description="Semua stok saat ini tercukupi" className="mt-6" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 4. PRODUK TERLARIS */}
        <Card padding="md" className="bg-white border border-slate-200 shadow-sm text-slate-900">
          <Typography variant="h3" className="text-slate-800 font-bold">Produk Terlaris</Typography>
          {summary?.topProducts?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {summary.topProducts.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                      {index + 1}
                    </div>
                    <p className="text-sm font-bold uppercase">{item.name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {safeVal(item.totalSold)} Terjual
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<TrendingUp className="h-12 w-12 text-slate-100" />} title="Belum ada data" description="Lakukan transaksi keluar untuk melihat peringkat" className="mt-4" />
          )}
        </Card>

        {/* 5. RECOMMENDATIONS */}
        <Card padding="md" className="bg-white border border-slate-200 shadow-sm">
          <Typography variant="h3" className="text-slate-800 font-bold">Rekomendasi Restock AI</Typography>
          <RecommendationsPanel data={summary?.recommendations} />
        </Card>
      </div>
    </div>
  );
}