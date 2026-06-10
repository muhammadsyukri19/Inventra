'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { SmartScanner } from '@/components/organisms/smart-scanner';
import { CheckCircle2, Loader2, AlertCircle, Package, Info } from 'lucide-react';
import { inventoryService } from '@/features/inventory/services/inventory.service';
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [sku, setSku] = useState('');
  const [productData, setProductData] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const processResponse = (response: any) => {
    // Backend kamu membungkus data di dalam .data
    return response.data?.data || response.data || response;
  };

  const validateProduct = async (code: string) => {
    if (!code) return;
    try {
      setIsLoading(true);
      setError('');
      const response = await inventoryService.validateBarcode(code);
      const product = processResponse(response);
      
      if (product && product.sku) {
        setProductData(product);
        setSku(product.sku);
      } else {
        throw new Error("Produk tidak ditemukan");
      }
    } catch (err: any) {
      setProductData(null);
      setError('Produk tidak terdaftar di sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = (response: any) => {
    const product = processResponse(response);
    if (product && product.sku) {
      setProductData(product);
      setSku(product.sku); 
      setIsScannerOpen(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!productData) return;
    try {
      setIsLoading(true);
      
      // DATA TRANSAKSI (Sesuai Skema Zod Backend Kamu)
      const transactionData = {
        type: type,
        notes: notes || '-',
        items: [
          {
            productId: productData.id,
            quantity: Math.floor(Number(quantity)), // Harus bilangan bulat
            unitPrice: Number(productData.price),   // Harus angka
          }
        ]
      };

      /**
       * SOLUSI ERROR 422:
       * Berdasarkan schema.ts kamu, validator Zod mengharapkan 
       * seluruh data berada di dalam properti 'body'.
       */
      const payload = {
        body: transactionData 
      };

      await apiClient.post(API_ENDPOINTS.TRANSACTIONS, payload);
      
      alert('✅ BERHASIL! Transaksi telah disimpan.');
      
      // Reset Form
      setSku('');
      setProductData(null);
      setQuantity(1);
      setNotes('');
    } catch (err: any) {
      // Ambil detail error jika ada (untuk debug)
      const serverErr = err.response?.data;
      console.error("DEBUG 422:", serverErr);
      
      let errorMsg = serverErr?.message || 'Terjadi kesalahan validasi';
      if (serverErr?.errors) {
        errorMsg += ": " + JSON.stringify(serverErr.errors);
      }
      
      alert('❌ ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <Typography variant="h1" className="text-slate-900">Transaksi Baru</Typography>
        <Typography variant="body" color="secondary">
          Kelola stok masuk/keluar dengan validasi otomatis
        </Typography>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* SEKSI SKU */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4" /> SKU / Kode Barang
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50 text-slate-900"
                placeholder="Scan barcode atau ketik SKU..."
                value={sku || ''} 
                onChange={(e) => setSku(e.target.value)}
                onBlur={() => validateProduct(sku)}
              />
              <Button onClick={() => setIsScannerOpen(true)} variant="primary" className="rounded-xl px-6">
                Scan AI (Kamera)
              </Button>
            </div>

            {/* INFO PRODUK HASIL SCAN */}
            {productData && !isLoading && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800 animate-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-base">{productData.name}</p>
                  <div className="flex gap-4 mt-1 opacity-80">
                    <span>Stok: <strong>{productData.inventory?.currentStock ?? 0} {productData.unit}</strong></span>
                    <span>Harga: <strong>Rp{Number(productData.price).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {error && !productData && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" /> <span>{error}</span>
              </div>
            )}
          </div>

          {/* SEKSI JUMLAH & TIPE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Jumlah Barang</label>
              <input 
                type="number" 
                min="1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary bg-slate-50 text-slate-900" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tipe Transaksi</label>
              <select 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary bg-slate-50 text-slate-900 appearance-none cursor-pointer"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="IN">Barang Masuk (+)</option>
                <option value="OUT">Barang Keluar (-)</option>
              </select>
            </div>
          </div>

          {/* SEKSI CATATAN (KEMBALI DIMUNCULKAN) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Info className="w-4 h-4" /> Catatan Tambahan
            </label>
            <textarea 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary bg-slate-50 text-slate-900" 
              rows={3} 
              placeholder="Berikan keterangan (misal: pengadaan bulanan)..."
              value={notes || ''} 
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* TOMBOL SIMPAN */}
          <div className="pt-2">
            <Button 
              className="w-full py-7 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50" 
              disabled={!productData || isLoading}
              onClick={handleSaveTransaction}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-3" /> Memproses...
                </>
              ) : 'Simpan Transaksi'}
            </Button>
          </div>
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