'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { Package, Barcode, Loader2, Info } from 'lucide-react';
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { inventoryService } from '@/features/inventory/services/inventory.service';

export default function ReceivePage() {
  const [mounted, setMounted] = useState(false);
  const [sku, setSku] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  const processResponse = (response: any) => response.data?.data || response.data || response;

  const handleValidateSku = async () => {
    setError('');
    if (!sku) return;
    try {
      setIsLoading(true);
      const response = await inventoryService.validateBarcode(sku.trim());
      const p = processResponse(response);
      setProduct(p);
      setQuantity(1);
    } catch (err: any) {
      setProduct(null);
      setError(err?.response?.data?.message || err?.message || 'Produk tidak ditemukan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!product) return setError('Pilih produk terlebih dahulu');
    try {
      setIsLoading(true);
      setError('');

      const transactionData = {
        type: 'IN',
        notes: `Penerimaan - Supplier:${supplierId || '-'} PO:${purchaseOrder || '-'} ${notes ? `| ${notes}` : ''}`,
        items: [
          {
            productId: product.id,
            quantity: Math.floor(Number(quantity)),
            unitPrice: Number(product.price) || 0,
          }
        ]
      };

      const payload = { body: transactionData };

      await apiClient.post(API_ENDPOINTS.TRANSACTIONS, payload);

      alert('✅ Penerimaan berhasil disimpan.');
      setSku('');
      setProduct(null);
      setQuantity(1);
      setNotes('');
      setSupplierId('');
      setPurchaseOrder('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal menyimpan penerimaan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Typography variant="h1">Penerimaan Barang (Receiving)</Typography>
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm">Kembali</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Barcode className="h-5 w-5 text-primary-600" />
            <Typography variant="h3">Produk & SKU</Typography>
          </div>

          <div className="space-y-3">
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              onBlur={handleValidateSku}
              placeholder="Masukkan SKU atau scan..."
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleValidateSku} variant="primary" className="rounded-2xl">Cari</Button>
              <Button onClick={() => { setSku(''); setProduct(null); setError(''); }} variant="secondary">Reset</Button>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="animate-spin" /> Mencari produk...
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">{error}</div>
            )}

            {product && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-600">{product.name}</div>
                <div className="mt-2 text-sm text-slate-700">SKU: {product.sku} • Harga: Rp{Number(product.price || 0).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-primary-600" />
            <Typography variant="h3">Detail Penerimaan</Typography>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Supplier ID (opsional)</label>
            <input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />

            <label className="text-sm font-medium">Nomor PO (opsional)</label>
            <input value={purchaseOrder} onChange={(e) => setPurchaseOrder(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />

            <label className="text-sm font-medium">Jumlah</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-2xl border border-slate-300 px-4 py-3" />

            <label className="text-sm font-medium">Catatan</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-3" rows={3} />

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 flex items-center gap-2"><Info className="h-4 w-4 text-primary-600" />Catatan akan disertakan pada transaksi</div>
              <Button onClick={handleSubmit} loading={isLoading} variant="primary">Simpan Penerimaan</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
