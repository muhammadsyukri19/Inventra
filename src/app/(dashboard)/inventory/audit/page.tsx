'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { inventoryService } from '@/features/inventory/services/inventory.service';
import { useAdjustStock } from '@/features/inventory/hooks/useInventories';
import { AlertCircle, Barcode, CheckCircle2, Loader2, Package, Search } from 'lucide-react';

type AuditProduct = {
  id: string;
  sku: string;
  name: string;
  unit?: string;
  inventory?: {
    currentStock: number;
  };
};

export default function Page() {
  const [sku, setSku] = useState('');
  const [product, setProduct] = useState<AuditProduct | null>(null);
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const adjustMutation = useAdjustStock();

  const systemStock = product?.inventory?.currentStock ?? 0;
  const stockDifference = product ? physicalCount - systemStock : 0;
  const requiresAdjustment = product ? stockDifference !== 0 : false;
  const adjustmentLabel = useMemo(() => {
    if (!product) return '';
    if (stockDifference === 0) return 'Stok fisik sesuai dengan sistem.';
    if (stockDifference > 0) return `Tambah ${stockDifference} unit ke stok sistem.`;
    return `Kurangi ${Math.abs(stockDifference)} unit dari stok sistem.`;
  }, [product, stockDifference]);

  const processResponse = (response: any) => {
    return response.data?.data || response.data || response;
  };

  const handleSearchProduct = async () => {
    setError('');
    setSuccessMessage('');
    setProduct(null);

    const query = sku.trim();
    if (!query) {
      setError('Silakan masukkan SKU atau kode barang terlebih dahulu.');
      return;
    }

    try {
      setIsSearching(true);
      const response = await inventoryService.validateBarcode(query);
      const foundProduct = processResponse(response) as AuditProduct;

      if (!foundProduct || !foundProduct.id) {
        throw new Error('Produk tidak ditemukan.');
      }

      setProduct(foundProduct);
      setPhysicalCount(foundProduct.inventory?.currentStock ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Produk tidak ditemukan.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!product) {
      setError('Produk belum dipilih.');
      return;
    }
    if (!requiresAdjustment) {
      setSuccessMessage('Stok sudah sesuai, tidak perlu penyesuaian.');
      return;
    }

    try {
      setError('');
      await adjustMutation.mutateAsync({
        productId: product.id,
        payload: {
          movementType: 'ADJUSTMENT',
          quantity: stockDifference,
          reason: `Stock Opname: fisik ${physicalCount}, sistem ${systemStock}`,
        },
      });
      setSuccessMessage('Audit stok berhasil disimpan dan inventori diperbarui.');
      setProduct(null);
      setSku('');
      setPhysicalCount(0);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal menyimpan audit stok.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-5xl mx-auto">
      <div>
        <Typography variant="h1">Audit Stok Gudang</Typography>
        <Typography variant="body" color="secondary" className="mt-1 max-w-2xl">
          Lakukan stock opname dengan mengecek jumlah fisik terhadap stok sistem. Jika ada selisih, sistem akan menyimpan penyesuaian sebagai audit stok.
        </Typography>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Barcode className="h-5 w-5 text-primary-600" />
            <Typography variant="h3">Temukan Produk</Typography>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">SKU / Barcode</label>
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Masukkan SKU atau scan kode..."
            />

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={handleSearchProduct}
                loading={isSearching}
                className="rounded-2xl px-6"
              >
                {isSearching ? 'Mencari...' : 'Cari Produk'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSku('');
                  setProduct(null);
                  setPhysicalCount(0);
                  setError('');
                  setSuccessMessage('');
                }}
                className="rounded-2xl"
              >
                Reset
              </Button>
            </div>

            {error && (
              <div className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-5 w-5 text-primary-600" />
            <Typography variant="h3">Hasil Audit</Typography>
          </div>

          {!product && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Masukkan SKU produk lalu klik &quot;Cari Produk&quot; untuk mulai audit stok.
            </div>
          )}

          {product && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Produk</p>
                <Typography variant="h4" className="mt-1 text-slate-900">
                  {product.name}
                </Typography>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>SKU: {product.sku}</span>
                  <span>Unit: {product.unit ?? '-'}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Stok Sistem</p>
                  <Typography variant="h3" className="mt-1 text-slate-900">
                    {systemStock}
                  </Typography>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Jumlah Fisik</p>
                  <input
                    type="number"
                    min={0}
                    value={physicalCount}
                    onChange={(event) => setPhysicalCount(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Ringkasan Audit</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Search className="h-4 w-4 text-primary-600" />
                  {adjustmentLabel}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Typography variant="body-sm" color="secondary">
                  {requiresAdjustment
                    ? 'Simpan penyesuaian untuk merekam stock opname dengan alasan yang jelas.'
                    : 'Stok sudah akurat. Tidak ada penyesuaian yang dibutuhkan.'}
                </Typography>

                <Button
                  variant={requiresAdjustment ? 'primary' : 'secondary'}
                  onClick={handleSaveAudit}
                  disabled={adjustMutation.isPending || !product || !requiresAdjustment}
                  loading={adjustMutation.isPending}
                >
                  {adjustMutation.isPending ? 'Menyimpan...' : 'Simpan Audit Stok'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
