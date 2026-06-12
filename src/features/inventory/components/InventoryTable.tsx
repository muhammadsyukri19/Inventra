import React from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Settings, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Inventory } from '../types/inventory.types';
import type { ColumnDef } from '@/components/molecules/data-table/DataTable.types';

interface InventoryTableProps {
  data: Inventory[];
  isLoading: boolean;
  onAdjust: (inventory: Inventory) => void;
  onSettings: (inventory: Inventory) => void;
}

export function InventoryTable({
  data,
  isLoading,
  onAdjust,
  onSettings,
}: InventoryTableProps) {
  const getStockStatusBadge = (row: Inventory) => {
    if (row.currentStock === 0) {
      return (
        <Badge variant="danger" className="flex items-center gap-1 w-fit">
          <AlertCircle className="h-3 w-3" />
          <span>Habis</span>
        </Badge>
      );
    }
    if (row.currentStock <= row.reorderPoint) {
      return (
        <Badge variant="warning" className="flex items-center gap-1 w-fit">
          <AlertCircle className="h-3 w-3" />
          <span>Menipis</span>
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="w-fit">
        Aman
      </Badge>
    );
  };

  const columns: ColumnDef<Inventory>[] = [
    {
      key: 'sku',
      header: 'SKU / Produk',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-semibold text-text-secondary">
            {row.product?.sku || '-'}
          </span>
          <span className="font-semibold text-text-primary text-sm">
            {row.product?.name || '-'}
          </span>
          <span className="text-[11px] text-text-tertiary">
            {row.product?.category?.name || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => getStockStatusBadge(row),
    },
    {
      key: 'currentStock',
      header: 'Stok Saat Ini',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-text-primary">
            {row.currentStock.toLocaleString()}
          </span>
          <span className="text-xs text-text-tertiary capitalize">
            {row.product?.unit || 'pcs'}
          </span>
        </div>
      ),
    },
    {
      key: 'limits',
      header: 'Batas Min / Max',
      render: (row) => (
        <span className="text-xs text-text-secondary font-mono">
          Min: {row.minStock} / Max: {row.maxStock}
        </span>
      ),
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Point (ROP)',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-text-primary font-mono">
            {row.reorderPoint}
          </span>
          <span className="text-[10px] text-text-tertiary">
            Safety Stock: {row.safetyStock}
          </span>
        </div>
      ),
    },
    {
      key: 'leadTimeDays',
      header: 'Lead Time',
      render: (row) => (
        <span className="text-xs text-text-secondary">
          {row.leadTimeDays} Hari
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAdjust(row)}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            title="Adjust Stock"
          >
            Adjust Stok
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSettings(row)}
            leftIcon={<Settings className="h-3.5 w-3.5" />}
            title="Pengaturan Batas Stok"
          >
            Pengaturan
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="Tidak ada produk inventori ditemukan"
    />
  );
}
