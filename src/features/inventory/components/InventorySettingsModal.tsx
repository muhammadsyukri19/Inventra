import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/molecules/modal';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import type { Inventory, UpdateInventorySettingsPayload } from '../types/inventory.types';

const settingsFormSchema = z.object({
  minStock: z.number().int('Batas minimum harus angka bulat').min(0, 'Minimal 0'),
  maxStock: z.number().int('Batas maksimum harus angka bulat').min(1, 'Minimal 1'),
  safetyStock: z.number().int('Safety stock harus angka bulat').min(0, 'Minimal 0').optional(),
  reorderPoint: z.number().int('Reorder point harus angka bulat').min(0, 'Minimal 0').optional(),
  leadTimeDays: z.number().int('Lead time harus angka bulat').min(1, 'Minimal 1 hari'),
}).refine((data) => data.maxStock >= data.minStock, {
  message: 'Batas maksimum tidak boleh lebih kecil dari batas minimum',
  path: ['maxStock'],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface InventorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateInventorySettingsPayload) => void;
  isLoading: boolean;
  inventory?: Inventory | null;
}

export function InventorySettingsModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  inventory,
}: InventorySettingsModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
  });

  useEffect(() => {
    if (inventory && isOpen) {
      reset({
        minStock: inventory.minStock,
        maxStock: inventory.maxStock,
        safetyStock: inventory.safetyStock,
        reorderPoint: inventory.reorderPoint,
        leadTimeDays: inventory.leadTimeDays,
      });
    }
  }, [inventory, reset, isOpen]);

  const handleFormSubmit = (data: SettingsFormValues) => {
    onSubmit({
      minStock: data.minStock,
      maxStock: data.maxStock,
      safetyStock: data.safetyStock,
      reorderPoint: data.reorderPoint,
      leadTimeDays: data.leadTimeDays,
    });
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Batal
      </Button>
      <Button type="submit" form="inventory-settings-form" loading={isLoading}>
        Simpan Pengaturan
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Batas Inventori & Threshold"
      footer={footer}
    >
      {inventory && (
        <div className="mb-4 rounded-lg bg-surface-secondary p-3 border border-border-default">
          <Typography variant="body-sm" color="secondary">Produk:</Typography>
          <Typography variant="h4" className="text-text-primary">{inventory.product?.name}</Typography>
          <Typography variant="caption" color="secondary" className="font-mono mt-1 block">
            SKU: {inventory.product?.sku}
          </Typography>
        </div>
      )}

      <form
        id="inventory-settings-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4 animate-fade-in"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Batas Minimum Stok"
            type="number"
            required
            error={errors.minStock?.message}
            {...register('minStock', { valueAsNumber: true })}
          />

          <FormField
            label="Batas Maksimum Stok"
            type="number"
            required
            error={errors.maxStock?.message}
            {...register('maxStock', { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Safety Stock (Stok Cadangan)"
            type="number"
            error={errors.safetyStock?.message}
            helperText="Diisi otomatis oleh AI jika dikosongkan"
            {...register('safetyStock', { valueAsNumber: true })}
          />

          <FormField
            label="Reorder Point (ROP)"
            type="number"
            error={errors.reorderPoint?.message}
            helperText="Titik pemesanan kembali otomatis"
            {...register('reorderPoint', { valueAsNumber: true })}
          />
        </div>

        <FormField
          label="Lead Time Pengiriman (Hari)"
          type="number"
          required
          error={errors.leadTimeDays?.message}
          helperText="Waktu tunggu barang datang sejak dipesan"
          {...register('leadTimeDays', { valueAsNumber: true })}
        />
      </form>
    </Modal>
  );
}
