'use client';

import { Typography } from '@/components/atoms/typography';
import { SupplierContainer } from '@/features/supplier/components/SupplierContainer';

export default function Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Typography variant="h1">Manajemen Supplier</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          Kelola database supplier dan kontak person resmi
        </Typography>
      </div>

      <SupplierContainer />
    </div>
  );
}

