import React, { useState } from 'react';
import { useInventories, useAdjustStock, useUpdateInventorySettings } from '../hooks/useInventories';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { InventoryTable } from './InventoryTable';
import { AdjustStockModal } from './AdjustStockModal';
import { InventorySettingsModal } from './InventorySettingsModal';
import { SearchBar } from '@/components/molecules/search-bar';
import { Pagination } from '@/components/molecules/pagination';
import { StatCard } from '@/components/molecules/stat-card';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { Package, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Inventory, AdjustStockPayload, UpdateInventorySettingsPayload } from '../types/inventory.types';

export function InventoryContainer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState<'low' | 'out' | 'safe' | ''>('');

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  // Queries
  const { data: response, isLoading, isError } = useInventories({
    page,
    limit: 10,
    search: search || undefined,
    stockStatus: stockStatus || undefined,
  });

  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();

  // Mutations
  const adjustMutation = useAdjustStock();
  const settingsMutation = useUpdateInventorySettings();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStockStatus(e.target.value as any);
    setPage(1);
  };

  const handleAdjustClick = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setIsAdjustOpen(true);
  };

  const handleSettingsClick = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setIsSettingsOpen(true);
  };

  const handleAdjustClose = () => {
    setIsAdjustOpen(false);
    setSelectedInventory(null);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setSelectedInventory(null);
  };

  const handleAdjustSubmit = async (payload: AdjustStockPayload) => {
    if (!selectedInventory) return;
    try {
      await adjustMutation.mutateAsync({
        productId: selectedInventory.productId,
        payload,
      });
      handleAdjustClose();
    } catch (error: any) {
      console.error('Failed to adjust stock', error);
      alert(`Gagal menyesuaikan stok: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSettingsSubmit = async (payload: UpdateInventorySettingsPayload) => {
    if (!selectedInventory) return;
    try {
      await settingsMutation.mutateAsync({
        productId: selectedInventory.productId,
        payload,
      });
      handleSettingsClose();
    } catch (error: any) {
      console.error('Failed to save settings', error);
      alert(`Gagal menyimpan pengaturan: ${error.response?.data?.message || error.message}`);
    }
  };

  const inventories = response?.data || [];
  const meta = response?.meta || { totalPages: 1 };

  // Calculate local stat card counters
  const totalProducts = summary?.totalProducts ?? 0;
  const lowStockCount = summary?.lowStockCount ?? 0;
  const outOfStockCount = summary?.outOfStockCount ?? 0;
  const safeStockCount = Math.max(0, totalProducts - lowStockCount - outOfStockCount);

  return (
    <div className="space-y-6">
      {/* ── METRICS SUMMARY HEADER ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total SKU */}
        <div
          onClick={() => setStockStatus('')}
          className={cn(
            'cursor-pointer transition-all duration-200 rounded-xl overflow-hidden',
            stockStatus === '' 
              ? 'ring-2 ring-primary-500 scale-[1.02] border-transparent shadow-md shadow-primary-500/10' 
              : 'hover:scale-[1.01] hover:shadow-sm'
          )}
          title="Tampilkan semua produk"
        >
          <StatCard
            label="Total Jenis Produk"
            value={isSummaryLoading ? '...' : totalProducts.toString()}
            icon={<Package className="h-5 w-5 text-primary-600" />}
            iconBg="bg-primary-50 text-primary-600"
          />
        </div>

        {/* Metric 2: Stok Aman */}
        <div
          onClick={() => setStockStatus('safe')}
          className={cn(
            'cursor-pointer transition-all duration-200 rounded-xl overflow-hidden',
            stockStatus === 'safe' 
              ? 'ring-2 ring-success-500 scale-[1.02] border-transparent shadow-md shadow-success-500/10' 
              : 'hover:scale-[1.01] hover:shadow-sm'
          )}
          title="Filter stok aman"
        >
          <StatCard
            label="Stok Aman"
            value={isSummaryLoading ? '...' : safeStockCount.toString()}
            icon={<CheckCircle className="h-5 w-5 text-success-600" />}
            iconBg="bg-success-50 text-success-600"
          />
        </div>

        {/* Metric 3: Stok Menipis */}
        <div
          onClick={() => setStockStatus('low')}
          className={cn(
            'cursor-pointer transition-all duration-200 rounded-xl overflow-hidden',
            stockStatus === 'low' 
              ? 'ring-2 ring-warning-500 scale-[1.02] border-transparent shadow-md shadow-warning-500/10' 
              : 'hover:scale-[1.01] hover:shadow-sm'
          )}
          title="Filter stok menipis"
        >
          <StatCard
            label="Stok Menipis"
            value={isSummaryLoading ? '...' : lowStockCount.toString()}
            icon={<AlertTriangle className="h-5 w-5 text-warning-600" />}
            iconBg="bg-warning-50 text-warning-600"
          />
        </div>

        {/* Metric 4: Stok Habis */}
        <div
          onClick={() => setStockStatus('out')}
          className={cn(
            'cursor-pointer transition-all duration-200 rounded-xl overflow-hidden',
            stockStatus === 'out' 
              ? 'ring-2 ring-danger-500 scale-[1.02] border-transparent shadow-md shadow-danger-500/10' 
              : 'hover:scale-[1.01] hover:shadow-sm'
          )}
          title="Filter stok habis"
        >
          <StatCard
            label="Stok Habis"
            value={isSummaryLoading ? '...' : outOfStockCount.toString()}
            icon={<AlertCircle className="h-5 w-5 text-danger-600" />}
            iconBg="bg-danger-50 text-danger-600"
          />
        </div>
      </div>

      {/* ── DYNAMIC SYSTEM ALERTS ─────────────────────────────────────────── */}
      {!isSummaryLoading && (lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="rounded-xl border border-warning-200 bg-warning-50/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
            <div>
              <Typography variant="body" weight="semibold" className="text-warning-800">
                Peringatan Inventori: Terdapat Produk Butuh Perhatian!
              </Typography>
              <Typography variant="body-sm" className="text-warning-700 mt-0.5">
                Ada {outOfStockCount} produk habis dan {lowStockCount} produk dengan stok menipis. Segera lakukan pemesanan atau restock barang ke supplier Anda.
              </Typography>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {outOfStockCount > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setStockStatus('out')}
              >
                Lihat Produk Habis
              </Button>
            )}
            {lowStockCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="border-warning-300 hover:bg-warning-100 text-warning-800"
                onClick={() => setStockStatus('low')}
              >
                Lihat Stok Menipis
              </Button>
            )}
            {stockStatus !== '' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStockStatus('')}
              >
                Tampilkan Semua
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER ACTIONS BAR ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari SKU atau nama produk..."
            className="w-full sm:max-w-md"
          />
          <div className="relative w-full sm:w-48">
            <select
              value={stockStatus}
              onChange={handleStatusFilterChange}
              className="w-full h-10 rounded-lg border border-border-default bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer appearance-none"
              aria-label="Filter status stok"
            >
              <option value="">Semua Status Stok</option>
              <option value="safe">Stok Aman</option>
              <option value="low">Stok Menipis</option>
              <option value="out">Stok Habis</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-tertiary">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700 animate-fade-in">
          Terjadi kesalahan saat memuat data inventori. Silakan coba lagi.
        </div>
      )}

      {/* Main Table */}
      {!isError && (
        <div className="space-y-4">
          <InventoryTable
            data={inventories}
            isLoading={isLoading}
            onAdjust={handleAdjustClick}
            onSettings={handleSettingsClick}
          />

          {/* Pagination */}
          <div className="flex justify-end">
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <AdjustStockModal
        isOpen={isAdjustOpen}
        onClose={handleAdjustClose}
        onSubmit={handleAdjustSubmit}
        isLoading={adjustMutation.isPending}
        inventory={selectedInventory}
      />

      {/* Threshold / Limits Settings Modal */}
      <InventorySettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSubmit={handleSettingsSubmit}
        isLoading={settingsMutation.isPending}
        inventory={selectedInventory}
      />
    </div>
  );
}
