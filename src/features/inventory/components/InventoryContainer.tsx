import React, { useState } from 'react';
import { useInventories, useAdjustStock, useUpdateInventorySettings } from '../hooks/useInventories';
import { InventoryTable } from './InventoryTable';
import { AdjustStockModal } from './AdjustStockModal';
import { InventorySettingsModal } from './InventorySettingsModal';
import { SearchBar } from '@/components/molecules/search-bar';
import { Pagination } from '@/components/molecules/pagination';
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

  return (
    <div className="space-y-6">
      {/* Filters & Search Bar */}
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
