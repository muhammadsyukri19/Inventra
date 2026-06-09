'use client';

import { Typography } from '@/components/atoms/typography';
import { EmptyState } from '@/components/molecules/empty-state';
import { Settings } from 'lucide-react';

export default function Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Typography variant="h1">Manajemen Pengguna</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          Kelola akun staf dan admin
        </Typography>
      </div>

      <div className="rounded-xl border border-border-default bg-surface p-6">
        <EmptyState
          icon={<Settings className="h-12 w-12 text-primary-400 animate-spin-slow" />}
          title="Sedang Dalam Pengembangan"
          description="Halaman ini akan segera hadir pada update berikutnya."
        />
      </div>
    </div>
  );
}
