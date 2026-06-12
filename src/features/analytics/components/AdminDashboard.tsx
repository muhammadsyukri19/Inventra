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
} from 'recharts';
import { Card } from '@/components/atoms/card/Card';
import { Typography } from '@/components/atoms/typography';
import { Badge } from '@/components/atoms/badge';
import {
  Users,
  UserCheck,
  FileText,
  Clock,
} from 'lucide-react';
import type { AdminAnalytics } from '../types/analytics.types';

interface AdminDashboardProps {
  data: AdminAnalytics;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  // Defensive check during role transitions
  if (!data || !data.userActivity) {
    return null;
  }

  const { metrics, userActivity, logs } = data;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-6">

      {/* ── METRICS GRID ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Users */}
        <Card className="p-5 border border-border-default hover:border-primary-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Total Pengguna Terdaftar
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.totalUsers}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Jumlah akun terdaftar dalam sistem
          </Typography>
        </Card>

        {/* Metric 2: Pending Approval */}
        <Card className="p-5 border border-border-default hover:border-warning-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Persetujuan Akun Pending
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.pendingUsers}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-warning-50 text-warning-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Pengguna baru menunggu konfirmasi Admin
          </Typography>
        </Card>

        {/* Metric 3: Total Transactions */}
        <Card className="p-5 border border-border-default hover:border-indigo-200 transition-all rounded-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Typography variant="body-sm" color="tertiary" weight="medium">
                Total Transaksi Berjalan
              </Typography>
              <Typography variant="h3" weight="bold" className="text-text-primary">
                {metrics.totalTransactions}
              </Typography>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <Typography variant="caption" color="tertiary" className="mt-3">
            Akumulasi transaksi barang keluar/masuk
          </Typography>
        </Card>
      </div>

      {/* ── CHARTS & SYSTEM LOGS SECTION ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Activity contribution graph */}
        <Card className="p-5 border border-border-default rounded-xl">
          <div className="mb-4">
            <Typography variant="body" weight="semibold">
              Kontribusi Transaksi Pengguna (30 Hari Terakhir)
            </Typography>
            <Typography variant="caption" color="tertiary" className="mt-0.5">
              Distribusi jumlah total pembuatan transaksi oleh staff.
            </Typography>
          </div>

          <div className="h-72 w-full">
            {userActivity.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Typography variant="body-sm" color="tertiary">Tidak ada aktivitas transaksi</Typography>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivity} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
                  <Bar dataKey="count" name="Jumlah Transaksi" fill="var(--color-indigo-500, #6366f1)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Recent Activity audit logs */}
        <Card className="lg:col-span-2 p-5 border border-border-default rounded-xl overflow-hidden">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <div>
              <Typography variant="body" weight="semibold">
                Audit Log Aktivitas Transaksi Terbaru
              </Typography>
              <Typography variant="caption" color="tertiary" className="mt-0.5">
                Pemantauan real-time aktivitas mutasi yang terekam di sistem.
              </Typography>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-text-tertiary font-medium">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pengguna</th>
                  <th className="py-2.5 px-3">Aksi</th>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-tertiary">
                      Tidak ada log aktivitas transaksi
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="py-3 px-3 text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 font-medium text-text-primary">
                        {log.user}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={log.action.includes('Masuk') ? 'success' : 'primary'}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-text-secondary">
                        {log.code}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-text-primary whitespace-nowrap">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(log.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
