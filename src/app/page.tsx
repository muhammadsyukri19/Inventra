'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { Card } from '@/components/atoms/card';
import {
  Package,
  BarChart3,
  BrainCircuit,
  Camera,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white">
              <Package className="h-5 w-5" />
            </div>
            <Typography variant="h3" as="span" className="font-bold text-primary-900">
              Inventra
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-primary-700 hover:bg-primary-50">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="shadow-sm">
                Coba Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 pt-20 pb-32">
          <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
          <div className="container relative mx-auto px-6 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 mb-8 text-sm font-medium animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse"></span>
              Sistem Manajemen Inventaris Generasi Baru
            </div>
            <Typography variant="h1" className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 animate-slide-up">
              Kelola Stok <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Lebih Cerdas</span> dengan AI
            </Typography>
            <Typography variant="body" className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up">
              Inventra memadukan Analitik Prediktif dan Identifikasi Visual untuk mengotomatisasi restock barang, mengurangi risiko kehabisan stok, dan meningkatkan efisiensi operasional bisnis Anda.
            </Typography>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all duration-300">
                  Mulai Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl bg-white/50 backdrop-blur-sm border-primary-200 text-primary-800 hover:bg-white hover:border-primary-300">
                  Login ke Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative z-10 -mt-8 rounded-t-[3rem] shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <Typography variant="h2" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Fitur Unggulan Inventra
              </Typography>
              <Typography variant="body" className="text-gray-600 max-w-2xl mx-auto">
                Dibangun dengan teknologi modern dan desain modular untuk skalabilitas jangka panjang.
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <FeatureCard
                icon={<BrainCircuit className="h-8 w-8 text-primary-600" />}
                title="Analitik Prediktif (AI)"
                description="Algoritma cerdas yang menganalisis tren penjualan historis untuk merekomendasikan waktu dan jumlah restock yang optimal."
              />
              {/* Feature 2 */}
              <FeatureCard
                icon={<Camera className="h-8 w-8 text-primary-600" />}
                title="Identifikasi Visual"
                description="Fitur Smart Scanner berbasis Computer Vision untuk mendeteksi barang secara otomatis melalui kamera, mempercepat proses transaksi."
              />
              {/* Feature 3 */}
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8 text-primary-600" />}
                title="Dashboard Real-time"
                description="Pantau pergerakan stok, tren penjualan, dan peringatan barang hampir habis secara real-time dari satu tempat."
              />
              {/* Feature 4 */}
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8 text-primary-600" />}
                title="Role-Based Access"
                description="Sistem persetujuan admin dan kontrol akses berbasis role (Admin, Staff Gudang, Owner) untuk keamanan data."
              />
              {/* Feature 5 */}
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8 text-primary-600" />}
                title="Laporan Komprehensif"
                description="Hasilkan laporan penjualan dan pergerakan stok yang detail untuk membantu pengambilan keputusan bisnis."
              />
              {/* Feature 6 */}
              <FeatureCard
                icon={<Package className="h-8 w-8 text-primary-600" />}
                title="Manajemen Multikategori"
                description="Kelola ribuan SKU produk dari berbagai kategori dan supplier dengan mudah menggunakan arsitektur data yang efisien."
              />
            </div>
          </div>
        </section>

        {/* Statistics / Social Proof Section */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <StatItem
                value="99%"
                subtitle="Akurasi Stok"
                description="Data inventaris selalu tepat dengan prediksi AI"
              />
              <StatItem
                value="3 Role"
                subtitle="Pengguna Sistem"
                description="Admin, Staff Gudang, dan Owner"
              />
              <StatItem
                value="Real-time"
                subtitle="Analytics"
                description="Dashboard diperbarui secara langsung"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-900 text-white">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <Typography variant="h2" className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Siap untuk Transformasi Bisnis Anda?
            </Typography>
            <Typography variant="body" className="text-primary-200 mb-10 text-lg">
              Tingkatkan akurasi stok hingga 99% dan hindari kerugian akibat overstock atau stockout. Bergabunglah dengan Inventra hari ini.
            </Typography>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary-900 hover:bg-gray-100 text-lg px-10 py-6 rounded-xl font-bold shadow-xl">
                  Mulai Gratis
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-10 py-6 rounded-xl font-bold">
                  Login ke Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 text-center">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Package className="h-6 w-6 text-primary-600" />
            <Typography variant="h4" className="font-bold text-gray-900">
              Inventra
            </Typography>
          </div>
          <Typography variant="body-sm" className="text-gray-500">
            © 2026 INVENTRA — Sistem Manajemen Inventaris Berbasis AI
          </Typography>
        </div>
      </footer>
    </div>
  );
}

/**
 * FeatureCard
 *
 * Menampilkan satu kartu fitur unggulan Inventra dengan ikon, judul, dan deskripsi.
 */
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 bg-white">
      <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <Typography variant="h3" className="text-xl font-bold text-gray-900 mb-3">
        {title}
      </Typography>
      <Typography variant="body" className="text-gray-600 leading-relaxed">
        {description}
      </Typography>
    </Card>
  );
}

/**
 * StatItem
 *
 * Menampilkan satu item statistik/social proof dengan nilai besar, subtitle, dan deskripsi.
 */
function StatItem({ value, subtitle, description }: { value: string; subtitle: string; description: string }) {
  return (
    <div className="text-center px-4">
      <Typography variant="h1" className="text-5xl font-extrabold text-primary-700 mb-2">
        {value}
      </Typography>
      <Typography variant="h3" className="text-lg font-bold text-gray-900 mb-2">
        {subtitle}
      </Typography>
      <Typography variant="body-sm" className="text-gray-600">
        {description}
      </Typography>
    </div>
  );
}
