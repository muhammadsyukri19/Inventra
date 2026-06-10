'use client';

import { useState } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { SmartScanner } from '@/components/organisms/smart-scanner';
import { AlertCircle, CheckCircle2 } from 'lucide-react'; // Tambahkan icon untuk feedback

export default function Page() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [productData, setProductData] = useState<any>(null); // State untuk menyimpan data produk hasil scan

  // Fungsi ini dipanggil setelah SmartScanner (Step 3) berhasil validasi ke backend
  const handleScanSuccess = (product: any) => {
    setSku(product.sku || product.code); // Isi input SKU otomatis
    setProductData(product); // Simpan data produk (nama, stok, dll)
    setIsScannerOpen(false); // Tutup scanner
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <Typography variant="h1">Transaksi Baru</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          Input barang masuk atau keluar dengan validasi otomatis
        </Typography>
      </div>

      <div className="rounded-xl border border-border-default bg-surface p-6 max-w-2xl shadow-sm">
        <div className="space-y-4">
          {/* Input SKU & Tombol Scan */}
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary">SKU / Kode Barang</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 rounded-md border border-default px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                placeholder="Misal: PROD-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <Button onClick={() => setIsScannerOpen(true)} variant="primary">
                Scan AI (Kamera)
              </Button>
            </div>

            {/* Feedback Validasi: Menampilkan Nama Barang jika ditemukan */}
            {productData && (
              <div className="mt-2 p-2 bg-success/10 border border-success/20 rounded-md flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Produk Ditemukan: <strong>{productData.name}</strong> (Stok saat ini: {productData.stock})</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah</label>
              <input type="number" className="w-full rounded-md border border-default px-3 py-2 outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Transaksi</label>
              <select className="w-full rounded-md border border-default px-3 py-2 outline-none">
                <option value="IN">Barang Masuk</option>
                <option value="OUT">Barang Keluar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea className="w-full rounded-md border border-default px-3 py-2 outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Tambahkan keterangan..."></textarea>
          </div>

          <Button className="w-full py-6 text-lg font-semibold" disabled={!productData}>
            Simpan Transaksi
          </Button>
        </div>
      </div>

      {/* Komponen Scanner */}
      {isScannerOpen && (
        <SmartScanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setIsScannerOpen(false)} 
          title="Validasi Barcode Produk"
        />
      )}
    </div>
  );
}