'use client';

import { useState } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { SmartScanner } from '@/components/organisms/smart-scanner';

export default function Page() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [sku, setSku] = useState('');

  const handleScanSuccess = (decodedText: string) => {
    setSku(decodedText);
    setIsScannerOpen(false);
    // You can optionally fetch product details using this SKU from your API here
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Typography variant="h1">Transaksi Baru</Typography>
        <Typography variant="body" color="secondary" className="mt-1">
          Input barang masuk atau keluar
        </Typography>
      </div>

      <div className="rounded-xl border border-border-default bg-surface p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU / Kode Barang</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 rounded-md border border-default px-3 py-2"
                placeholder="Misal: PROD-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <Button onClick={() => setIsScannerOpen(true)} variant="primary">
                Scan AI (Kamera)
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah</label>
            <input type="number" className="w-full rounded-md border border-default px-3 py-2" placeholder="0" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea className="w-full rounded-md border border-default px-3 py-2" rows={3}></textarea>
          </div>

          <Button className="w-full">Simpan Transaksi</Button>
        </div>
      </div>

      {isScannerOpen && (
        <SmartScanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}
    </div>
  );
}
