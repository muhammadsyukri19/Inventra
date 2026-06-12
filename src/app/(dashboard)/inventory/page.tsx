'use client';

import Link from 'next/link';
import { Typography } from '@/components/atoms/typography';
import { InventoryContainer } from '@/features/inventory/components/InventoryContainer';
import { Button } from '@/components/atoms/button';
import { ROUTES } from '@/constants/routes';

export default function Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography variant="h1">Inventori Gudang</Typography>
          <Typography variant="body" color="secondary" className="mt-1">
            Pantau stok produk, batas minimum/maksimum, dan sesuaikan kuantitas
          </Typography>
        </div>
        <Link href={ROUTES.INVENTORY_AUDIT}>
          <Button size="sm">Audit Stok</Button>
        </Link>
      </div>

      <InventoryContainer />
    </div>
  );
}

