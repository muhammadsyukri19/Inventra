'use client';

import { Typography } from '@/components/atoms/typography';
import { InventoryContainer } from '@/features/inventory/components/InventoryContainer';

export default function Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Typography variant="h1">Inventori Gudang</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          Pantau stok produk, batas minimum/maksimum, dan sesuaikan kuantitas
        </Typography>
      </div>

      <InventoryContainer />
    </div>
  );
}

