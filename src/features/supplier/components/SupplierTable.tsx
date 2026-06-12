import React from 'react';
import { DataTable } from '@/components/molecules/data-table';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Edit2, ToggleLeft, ToggleRight, Phone, Mail, MapPin, User } from 'lucide-react';
import type { Supplier } from '../types/supplier.types';
import type { ColumnDef } from '@/components/molecules/data-table/DataTable.types';

interface SupplierTableProps {
  data: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isToggling: boolean;
}

export function SupplierTable({
  data,
  isLoading,
  onEdit,
  onToggleStatus,
  isToggling,
}: SupplierTableProps) {
  const columns: ColumnDef<Supplier>[] = [
    {
      key: 'name',
      header: 'Nama Supplier',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-text-primary text-sm">{row.name}</span>
          {row.contactPerson && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <User className="h-3 w-3" />
              <span>CP: {row.contactPerson}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Telepon',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Phone className="h-3.5 w-3.5 text-text-tertiary" />
          <span className="font-mono text-xs">{row.phone || '-'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Mail className="h-3.5 w-3.5 text-text-tertiary" />
          <span className="text-xs">{row.email || '-'}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Alamat',
      render: (row) => (
        <div className="flex items-start gap-1.5 text-text-secondary max-w-[200px]">
          <MapPin className="h-3.5 w-3.5 text-text-tertiary mt-0.5 flex-shrink-0" />
          <span className="text-xs line-clamp-2">{row.address || '-'}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            title="Edit Supplier"
          >
            Edit
          </Button>
          <Button
            variant={row.isActive ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => onToggleStatus(row.id, row.isActive)}
            disabled={isToggling}
            leftIcon={
              row.isActive ? (
                <ToggleRight className="h-4 w-4 text-success-500" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-text-tertiary" />
              )
            }
            title={row.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {row.isActive ? 'Nonaktifkan' : 'Aktifkan'}
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
      emptyMessage="Tidak ada supplier ditemukan"
    />
  );
}
