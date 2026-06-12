import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/molecules/modal';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import type { Inventory, AdjustStockPayload } from '../types/inventory.types';

const adjustStockSchema = z.object({
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().int('Jumlah harus berupa angka bulat').min(1, 'Jumlah minimal adalah 1'),
  reason: z.string().min(3, 'Alasan penyesuaian minimal 3 karakter'),
});

type AdjustStockValues = z.infer<typeof adjustStockSchema>;

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: AdjustStockPayload) => void;
  isLoading: boolean;
  inventory?: Inventory | null;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  inventory,
}: AdjustStockModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustStockValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      movementType: 'IN',
      quantity: 1,
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        movementType: 'IN',
        quantity: 1,
        reason: '',
      });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: AdjustStockValues) => {
    onSubmit({
      movementType: data.movementType,
      quantity: data.quantity,
      reason: data.reason,
    });
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Batal
      </Button>
      <Button type="submit" form="adjust-stock-form" loading={isLoading}>
        Simpan Penyesuaian
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stok Gudang (Manual)"
      footer={footer}
    >
      {inventory && (
        <div className="mb-4 rounded-lg bg-surface-secondary p-3 border border-border-default">
          <Typography variant="body-sm" color="secondary">Produk:</Typography>
          <Typography variant="h4" className="text-text-primary">{inventory.product?.name}</Typography>
          <div className="flex gap-4 mt-2 text-xs text-text-secondary font-mono">
            <span>SKU: {inventory.product?.sku}</span>
            <span>Stok Saat Ini: <strong className="text-text-primary">{inventory.currentStock} {inventory.product?.unit}</strong></span>
          </div>
        </div>
      )}

      <form
        id="adjust-stock-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-primary">Tipe Penyesuaian</label>
          <select
            id="movementType"
            className="block w-full rounded-lg border border-border-default bg-surface p-2.5 text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            {...register('movementType')}
          >
            <option value="IN">Stok Masuk (+)</option>
            <option value="OUT">Stok Keluar (-)</option>
            <option value="ADJUSTMENT">Koreksi Penyesuaian (±)</option>
          </select>
          {errors.movementType && (
            <p className="text-xs text-danger-600">{errors.movementType.message}</p>
          )}
        </div>

        <FormField
          label="Jumlah Penyesuaian"
          type="number"
          placeholder="Jumlah barang..."
          required
          error={errors.quantity?.message}
          {...register('quantity', { valueAsNumber: true })}
        />

        <FormField
          label="Alasan Penyesuaian"
          placeholder="Contoh: Pengadaan stok bulanan, Koreksi barang rusak..."
          required
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}
