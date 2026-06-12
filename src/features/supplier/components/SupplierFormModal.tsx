import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/molecules/modal';
import { FormField } from '@/components/molecules/form-field';
import { Button } from '@/components/atoms/button';
import type { Supplier, CreateSupplierPayload } from '../types/supplier.types';

const supplierFormSchema = z.object({
  name: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().min(6, 'Nomor telepon minimal 6 angka').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  contactPerson: z.string().optional().or(z.literal('')),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSupplierPayload) => void;
  isLoading: boolean;
  supplier?: Supplier | null; // If provided, we are in Edit Mode
}

export function SupplierFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  supplier,
}: SupplierFormModalProps) {
  const isEditMode = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
    },
  });

  // Load supplier details when editing
  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        contactPerson: supplier.contactPerson || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
      });
    }
  }, [supplier, reset, isOpen]);

  const handleFormSubmit = (data: SupplierFormValues) => {
    // Convert empty strings back to undefined before sending to api
    const payload: CreateSupplierPayload = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      contactPerson: data.contactPerson || undefined,
    };
    onSubmit(payload);
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Batal
      </Button>
      <Button type="submit" form="supplier-form" loading={isLoading}>
        {isEditMode ? 'Simpan Perubahan' : 'Tambah Supplier'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}
      footer={footer}
    >
      <form
        id="supplier-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          label="Nama Supplier"
          placeholder="Masukkan nama supplier..."
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <FormField
          label="Contact Person (CP)"
          placeholder="Nama narahubung / contact person..."
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nomor Telepon"
            type="tel"
            placeholder="Contoh: 08123456..."
            error={errors.phone?.message}
            {...register('phone')}
          />

          <FormField
            label="Email"
            type="email"
            placeholder="sales@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-primary">Alamat Lengkap</label>
          <textarea
            id="address"
            placeholder="Alamat kantor / gudang supplier..."
            className="block w-full rounded-lg border border-border-default bg-surface p-3 text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            rows={3}
            {...register('address')}
          />
        </div>
      </form>
    </Modal>
  );
}
