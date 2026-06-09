import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/libs/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sistem Manajemen Inventaris',
    template: '%s | Inventaris',
  },
  description:
    'Sistem manajemen inventaris modular dengan komponen analitik penjualan dan layanan notifikasi real-time untuk UMKM dan toko retail.',
  keywords: ['inventaris', 'manajemen stok', 'UMKM', 'retail', 'analitik penjualan'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
