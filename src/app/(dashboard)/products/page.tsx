'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { DataTable } from '@/components/molecules/data-table';
import { Badge } from '@/components/atoms/badge';
import { Plus, Edit2, Trash2, Search, Package, Loader2, X, AlertCircle } from 'lucide-react';
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE MODAL TAMBAH ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sku: '', name: '', price: '', costPrice: '', categoryId: '', minStock: '5', maxStock: '50', leadTimeDays: '7'
  });

  // --- STATE MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS);
      const result = response.data.data;
      const actualArray = result?.data ?? [];
      setProducts(actualArray);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI EDIT (BUKA MODAL & ISI DATA) ---
  const handleEditClick = (product: any) => {
    setEditFormData({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      costPrice: product.costPrice,
      categoryId: product.categoryId || product.category?.id,
      unit: product.unit || 'pcs'
    });
    setIsEditModalOpen(true);
  };

  // --- FUNGSI UPDATE KE SERVER ---
  const handleUpdateProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setIsSubmitting(true);
    
    // 1. Data yang akan diupdate
    const productData = {
      sku: editFormData.sku,
      name: editFormData.name,
      price: Number(editFormData.price),
      costPrice: Number(editFormData.costPrice),
      categoryId: editFormData.categoryId,
      unit: editFormData.unit || 'pcs',
      isActive: true
    };

    /**
     * PERBAIKAN: PAYLOAD UNTUK UPDATE
     * Berdasarkan error "params: Required", backend kamu meminta
     * struktur payload yang berisi 'params' DAN 'body'.
     */
    const payload = {
      params: { id: editFormData.id }, // INI YANG TADI KURANG
      body: productData
    };

    console.log("MENGIRIM UPDATE FINAL:", payload);

    // Kirim request PUT
    await apiClient.put(`${API_ENDPOINTS.PRODUCTS}/${editFormData.id}`, payload);
    
    alert("✅ Perubahan berhasil disimpan!");
    setIsEditModalOpen(false);
    fetchProducts(); // Refresh tabel
  } catch (error: any) {
    const serverErrors = error.response?.data?.errors;
    console.error("DETAIL ERROR VALIDASI:", serverErrors);

    let msg = error.response?.data?.message || "Gagal update";
    if (serverErrors) {
      msg += ": " + JSON.stringify(serverErrors);
    }
    
    alert("❌ " + msg);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        body: {
          ...formData,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice),
          minStock: Number(formData.minStock),
          maxStock: Number(formData.maxStock),
          leadTimeDays: Number(formData.leadTimeDays),
          unit: "pcs"
        }
      };
      await apiClient.post(API_ENDPOINTS.PRODUCTS, payload);
      alert("✅ Produk berhasil ditambahkan!");
      setIsAddModalOpen(false);
      setFormData({ sku: '', name: '', price: '', costPrice: '', categoryId: '', minStock: '5', maxStock: '50', leadTimeDays: '7' });
      fetchProducts();
    } catch (error: any) {
      alert("❌ Gagal: " + (error.response?.data?.message || "Validasi gagal"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await apiClient.delete(API_ENDPOINTS.PRODUCT_DETAIL(id));
        alert("✅ Berhasil dihapus");
        fetchProducts();
      } catch (error) {
        alert("❌ Gagal hapus");
      }
    }
  };

  const filteredProducts = Array.isArray(products) 
    ? products.filter((p: any) => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const columns: any[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (row: any) => <span className="font-mono font-bold text-primary-600">{row.sku}</span>
    },
    {
      key: 'name',
      header: 'Nama Produk',
      render: (row: any) => (
        <div className="flex flex-col text-slate-900">
          <span className="font-semibold uppercase">{row.name}</span>
          <span className="text-xs text-slate-500">{row.category?.name || 'Umum'}</span>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Harga Jual',
      render: (row: any) => <span className="text-slate-900">Rp{Number(row.price).toLocaleString('id-ID')}</span>
    },
    {
      key: 'inventory',
      header: 'Stok',
      render: (row: any) => {
        const stock = row.inventory?.currentStock ?? 0;
        return <Badge variant={stock <= 5 ? 'danger' : 'success'}>{stock} {row.unit || 'pcs'}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row: any) => (
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(row)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h1" className="text-slate-900 font-extrabold">Manajemen Produk</Typography>
          <Typography variant="body" color="secondary">Kelola katalog barang dan stok inventaris</Typography>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex gap-2 items-center shadow-lg px-6 py-6 font-bold">
          <Plus className="h-5 w-5" /> Tambah Produk Baru
        </Button>
      </div>

      <Card padding="none" className="bg-white border-slate-200 shadow-sm overflow-hidden text-slate-900">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Cari SKU atau Nama..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24"><Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" /><Typography variant="body" color="secondary">Memuat katalog...</Typography></div>
          ) : filteredProducts.length > 0 ? (
            <DataTable columns={columns} data={filteredProducts} isLoading={isLoading} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400"><Package className="h-20 w-20 mb-4 opacity-20" /><Typography variant="h3">Produk Kosong</Typography></div>
          )}
        </div>
      </Card>

      {/* --- MODAL TAMBAH --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <Typography variant="h3">Tambah Produk Baru</Typography>
              <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-500 w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required className="w-full px-4 py-2 border rounded-lg text-slate-900" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                <input required className="w-full px-4 py-2 border rounded-lg text-slate-900" placeholder="Nama Produk" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" className="w-full px-4 py-2 border rounded-lg text-slate-900" placeholder="Harga Jual" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <input required type="number" className="w-full px-4 py-2 border rounded-lg text-slate-900" placeholder="Harga Pokok" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
              </div>
              <input required className="w-full px-4 py-2 border rounded-lg text-slate-900 font-mono text-sm" placeholder="ID Kategori (UUID)" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} />
              <Button type="submit" className="w-full py-4 font-bold" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : "Simpan Produk"}</Button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT --- */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50">
              <Typography variant="h3" className="text-blue-800">Edit Produk: {editFormData.sku}</Typography>
              <button onClick={() => setIsEditModalOpen(false)}><X className="text-slate-500 w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Produk</label>
                <input required className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg bg-white" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Harga Jual (Rp)</label>
                  <input required type="number" className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg bg-white" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Harga Pokok (Rp)</label>
                  <input required type="number" className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg bg-white" value={editFormData.costPrice} onChange={e => setEditFormData({...editFormData, costPrice: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">ID Kategori</label>
                <input required className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg font-mono text-xs bg-slate-50" value={editFormData.categoryId} onChange={e => setEditFormData({...editFormData, categoryId: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                 <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="flex-1">Batal</Button>
                 <Button type="submit" className="flex-1 font-bold py-4" disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}
                 </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}