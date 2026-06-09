import type { Metadata } from 'next';
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
  RefreshCw,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * Dashboard page.
 *
 * Menggunakan:
 * - Atoms: Typography, Card
 * - Molecules: StatCard (Card + Typography), EmptyState (Typography + Button)
 *
 * Semua UI element dibangun dari atom → molecule. Tidak ada raw HTML heading/div
 * yang menampilkan teks secara langsung.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header — Typography atoms */}
      <div>
        <Typography variant="h1">Dashboard</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          Ringkasan inventaris dan analitik penjualan
        </Typography>
      </div>

      {/* Summary cards — StatCard molecules (composed from Card + Typography atoms) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Produk"
          value="—"
          icon={<Package className="h-5 w-5" />}
          iconBg="bg-primary-100 text-primary-600"
        />
        <StatCard
          label="Total Stok"
          value="—"
          icon={<Warehouse className="h-5 w-5" />}
          iconBg="bg-secondary-100 text-secondary-600"
        />
        <StatCard
          label="Hampir Habis"
          value="—"
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-warning-50 text-warning-600"
        />
        <StatCard
          label="Stok Habis"
          value="—"
          icon={<XCircle className="h-5 w-5" />}
          iconBg="bg-danger-50 text-danger-600"
        />
        <StatCard
          label="Penjualan Bulan Ini"
          value="—"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-success-50 text-success-600"
        />
        <StatCard
          label="Transaksi Bulan Ini"
          value="—"
          icon={<ArrowLeftRight className="h-5 w-5" />}
          iconBg="bg-info-50 text-info-600"
        />
      </div>

      {/* Chart + Stock alerts — Card atoms + Typography atoms + EmptyState molecules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales chart */}
        <Card padding="md" className="lg:col-span-2">
          <Typography variant="h3">Grafik Penjualan</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Data penjualan 6 bulan terakhir
          </Typography>
          <EmptyState
            icon={<BarChart3 className="h-12 w-12" />}
            title="Belum ada data penjualan"
            description="Chart akan ditampilkan setelah transaksi tersedia"
            className="mt-6"
          />
        </Card>

        {/* Stock alerts */}
        <Card padding="md">
          <Typography variant="h3">Peringatan Stok</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Produk yang perlu diperhatikan
          </Typography>
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12" />}
            title="Belum ada peringatan"
            description="Semua stok dalam kondisi aman"
            className="mt-6"
          />
        </Card>
      </div>

      {/* Top products + Recommendations — Card atoms + EmptyState molecules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <Typography variant="h3">Produk Terlaris</Typography>
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title="Belum ada data"
            description="Produk terlaris akan ditampilkan setelah transaksi tersedia"
            className="mt-4"
          />
        </Card>

        <Card padding="md">
          <Typography variant="h3">Rekomendasi Restock AI</Typography>
          <RecommendationsPanel />
        </Card>
      </div>
    </div>
  );
}
