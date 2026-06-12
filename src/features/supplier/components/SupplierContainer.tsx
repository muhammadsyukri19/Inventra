import React, { useState } from 'react';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useToggleSupplierStatus } from '../hooks/useSuppliers';
import { SupplierTable } from './SupplierTable';
import { SupplierFormModal } from './SupplierFormModal';
import { SearchBar } from '@/components/molecules/search-bar';
import { Button } from '@/components/atoms/button';
import { Pagination } from '@/components/molecules/pagination';
import { Plus } from 'lucide-react';
import type { Supplier, CreateSupplierPayload } from '../types/supplier.types';

export function SupplierContainer() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Queries
  const { data: response, isLoading, isError } = useSuppliers({
    page,
    limit: 10,
    search: search || undefined,
  });

  // Mutations
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const toggleMutation = useToggleSupplierStatus();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset page to 1 on search
  };

  const handleAddClick = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleFormSubmit = async (payload: CreateSupplierPayload) => {
    try {
      if (selectedSupplier) {
        await updateMutation.mutateAsync({
          id: selectedSupplier.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleModalClose();
    } catch (error) {
      console.error('Failed to submit form', error);
      alert('Gagal menyimpan supplier. Silakan coba lagi.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const actionText = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
    if (confirm(`Apakah Anda yakin ingin ${actionText} supplier ini?`)) {
      try {
        await toggleMutation.mutateAsync({
          id,
          isActive: !currentStatus,
        });
      } catch (error) {
        console.error('Failed to toggle status', error);
        alert('Gagal memperbarui status supplier.');
      }
    }
  };

  const suppliers = response?.data || [];
  const meta = response?.meta || { totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Cari nama supplier atau kontak person..."
          className="w-full sm:max-w-md"
        />
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleAddClick}
          className="w-full sm:w-auto"
        >
          Tambah Supplier
        </Button>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700">
          Terjadi kesalahan saat memuat data supplier. Silakan coba lagi.
        </div>
      )}

      {/* Main Table */}
      {!isError && (
        <div className="space-y-4">
          <SupplierTable
            data={suppliers}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
            isToggling={toggleMutation.isPending}
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

      {/* Create / Edit Form Modal */}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        supplier={selectedSupplier}
      />
    </div>
  );
}
