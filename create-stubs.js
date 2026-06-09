const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'products', title: 'Manajemen Produk', desc: 'Kelola data produk inventaris' },
  { path: 'categories', title: 'Manajemen Kategori', desc: 'Kelola kategori produk' },
  { path: 'suppliers', title: 'Manajemen Supplier', desc: 'Kelola data supplier' },
  { path: 'inventory', title: 'Inventori Gudang', desc: 'Pantau dan kelola stok gudang' },
  { path: 'transactions', title: 'Transaksi Masuk/Keluar', desc: 'Catatan transaksi barang' },
  { path: 'analytics', title: 'Analitik Penjualan', desc: 'Laporan dan analitik' },
  { path: 'recommendations', title: 'Rekomendasi Restock', desc: 'Sistem cerdas rekomendasi stok' },
  { path: 'notifications', title: 'Notifikasi Sistem', desc: 'Pemberitahuan dan peringatan stok' },
  { path: 'users', title: 'Manajemen Pengguna', desc: 'Kelola akun staf dan admin' }
];

pages.forEach(p => {
  const content = `'use client';

import { Typography } from '@/components/atoms/typography';
import { EmptyState } from '@/components/molecules/empty-state';
import { Settings } from 'lucide-react';

export default function Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Typography variant="h1">${p.title}</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          ${p.desc}
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
`;
  
  const filePath = path.join(__dirname, 'src', 'app', '(dashboard)', p.path, 'page.tsx');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${filePath}`);
});
