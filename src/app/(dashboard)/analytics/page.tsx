'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/atoms/typography';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import {
  useOwnerAnalytics,
  useStaffAnalytics,
  useAdminAnalytics,
} from '@/features/analytics/hooks/useAnalytics';
import { OwnerDashboard } from '@/features/analytics/components/OwnerDashboard';
import { WarehouseDashboard } from '@/features/analytics/components/WarehouseDashboard';
import { AdminDashboard } from '@/features/analytics/components/AdminDashboard';
import { Spinner } from '@/components/atoms/spinner'; // Assuming there's a spinner or we make a basic loader inline
import { Card } from '@/components/atoms/card/Card';
import { Eye, AlertCircle } from 'lucide-react';

export default function Page() {
  const { user } = useAuthStore();
  const userRole = user?.role || 'staff_gudang';

  // Admin can toggle between views, other roles are locked to their own dashboard
  const [selectedRole, setSelectedRole] = useState<string>(userRole);

  const currentActiveRole = userRole === 'admin' ? selectedRole : userRole;

  const ownerQuery = useOwnerAnalytics(currentActiveRole === 'owner');
  const staffQuery = useStaffAnalytics(currentActiveRole === 'staff_gudang');
  const adminQuery = useAdminAnalytics(currentActiveRole === 'admin');

  // Select the query based on current active role
  const activeQuery =
    currentActiveRole === 'owner'
      ? ownerQuery
      : currentActiveRole === 'staff_gudang'
      ? staffQuery
      : adminQuery;

  const { isLoading, isError, error } = activeQuery;

  const renderDashboard = () => {
    switch (currentActiveRole) {
      case 'owner':
        return ownerQuery.data ? <OwnerDashboard data={ownerQuery.data} /> : null;
      case 'staff_gudang':
        return staffQuery.data ? <WarehouseDashboard data={staffQuery.data} /> : null;
      case 'admin':
        return adminQuery.data ? <AdminDashboard data={adminQuery.data} /> : null;
      default:
        return (
          <div className="p-6 text-center text-text-tertiary">
            Role dashboard "{currentActiveRole}" tidak dikenali.
          </div>
        );
    }
  };

  const getHeaderDescription = () => {
    switch (currentActiveRole) {
      case 'owner':
        return 'Analitik finansial aset dan proyeksi penjualan otomatis menggunakan Machine Learning (AI Forecasting).';
      case 'staff_gudang':
        return 'Pemantauan kesehatan ROP, kapasitas gudang, dan volume keluar-masuk barang.';
      case 'admin':
      default:
        return 'Pemantauan kontribusi transaksi pengguna, persetujuan akun, dan kesehatan sistem.';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── TOP HEADER & SWITCHER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default">
        <div>
          <Typography variant="h1">Pusat Analitik & Laporan</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            {getHeaderDescription()}
          </Typography>
        </div>

        {/* Render a custom dashboard switcher ONLY for admin users */}
        {userRole === 'admin' && (
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-xs text-text-tertiary font-medium">
              <Eye className="h-4 w-4" />
              Pratinjau Peran:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border-default bg-surface text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer font-medium"
              aria-label="Pilih pratinjau peran dashboard"
            >
              <option value="admin">Administrator Dashboard</option>
              <option value="owner">Owner (Business Intelligence)</option>
              <option value="staff_gudang">Staff Gudang (Operasional)</option>
            </select>
          </div>
        )}
      </div>

      {/* ── LOADING STATE ─────────────────────────────────────────────────── */}
      {isLoading && (
        <Card className="flex flex-col items-center justify-center py-20 border border-border-default rounded-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
          <Typography variant="body-sm" color="tertiary" className="mt-4 animate-pulse">
            Menganalisis data pergudangan & memproses ML forecasting...
          </Typography>
        </Card>
      )}

      {/* ── ERROR STATE ──────────────────────────────────────────────────── */}
      {isError && (
        <Card className="p-6 border border-danger-200 bg-danger-50/20 rounded-xl flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <Typography variant="body" weight="semibold" className="text-danger-800">
              Gagal Memuat Analitik
            </Typography>
            <Typography variant="body-sm" className="text-danger-700 mt-1">
              {(error as any)?.response?.data?.message || error?.message || 'Terjadi kesalahan sistem saat memuat data analitik.'}
            </Typography>
          </div>
        </Card>
      )}

      {/* ── DASHBOARD CONTENTS ────────────────────────────────────────────── */}
      {!isLoading && !isError && renderDashboard()}
    </div>
  );
}
