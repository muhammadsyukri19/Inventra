'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { DataTable } from '@/components/molecules/data-table';
import { Badge } from '@/components/atoms/badge';
import { Plus, Edit2, Trash2, Search, Package, Loader2, X, AlertCircle, TrendingUp, AlertTriangle, Info } from 'lucide-react';
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
  if (confirm("⚠️ PERINGATAN: Menghapus produk akan menghapus stok. Lanjutkan?")) {
    try {
      setIsLoading(true);

      // BUNGKUS PAYLOAD AGAR LOLOS ZOD
      const config = {
        data: {
          params: { id: id } 
        }
      };

      await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`, config);
      
      alert("✅ Berhasil dihapus!");
      fetchProducts(); // Refresh tabel
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal hapus (Cek riwayat transaksi)";
      alert("❌ " + msg);
    } finally {
      setIsLoading(false);
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
          <span className="font-semibold uppercase leading-tight">{row.name}</span>
          <span className="text-[10px] text-slate-400 font-medium">{row.category?.name || 'Umum'}</span>
        </div>
      )
    },
    {
      key: 'costPrice',
      header: 'Harga Pokok',
      render: (row: any) => (
        <span className="text-slate-900 font-bold">
          Rp{Number(row.costPrice || 0).toLocaleString('id-ID')}
        </span>
      )
    },
    {
      key: 'price',
      header: 'Harga Jual',
      render: (row: any) => {
        const price = Number(row.price);
        // Cek jika harga valid, jika tidak tampilkan 0
        const displayPrice = isNaN(price) ? 0 : price;
        return <span className="text-slate-900">Rp{displayPrice.toLocaleString('id-ID')}</span>
      }
    },
    {
      key: 'inventory',
      header: 'Stok',
      render: (row: any) => {
        // Cek jika stok valid
        const stock = Number(row.inventory?.currentStock);
        const safeStock = isNaN(stock) ? 0 : stock;
        return (
          <Badge variant={safeStock <= 5 ? 'danger' : 'success'}>
            {safeStock} {row.unit || 'pcs'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Aksi',
      // Kita buat container rata kiri (justify-start) agar pas di bawah tulisan "Aksi"
      render: (row: any) => (
        <div className="flex items-center justify-start gap-1 ml-[-8px]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-600 hover:bg-blue-50 transition-all rounded-lg" 
            onClick={() => handleEditClick(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-600 hover:bg-red-50 transition-all rounded-lg" 
            onClick={() => handleDelete(row.id)}
          >
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

      {isAddModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
      
      {/* Header Modal - Lebih Berwarna */}
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <Typography variant="h3" className="text-slate-900 font-bold">Tambah Produk Baru</Typography>
          <p className="text-xs text-slate-500 mt-1">Lengkapi informasi produk untuk menambah stok baru.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(false)} 
          className="p-2 hover:bg-slate-200 rounded-full transition-all"
        >
          <X className="text-slate-400 w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleAddProduct}>
        {/* Konten Modal - Menggunakan Padding 8 agar tidak rapat */}
        <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto">
          
          {/* SEKSI 1: INFORMASI DASAR */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary-600">
               <Package className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Informasi Dasar</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">SKU / Kode Barcode</label>
                <input 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900" 
                  value={formData.sku} 
                  onChange={e => setFormData({...formData, sku: e.target.value})} 
                  placeholder="Misal: 12345" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Produk</label>
                <input 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Masukkan nama barang..." 
                />
              </div>
            </div>
          </div>

          {/* SEKSI 2: HARGA & KATEGORI */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary-600">
               <TrendingUp className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Harga & Kategori</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Harga Jual (Rp)</label>
                <input 
                  required type="number" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all text-slate-900 font-medium" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Harga Pokok (Rp)</label>
                <input 
                  required type="number" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all text-slate-900 font-medium" 
                  value={formData.costPrice} 
                  onChange={e => setFormData({...formData, costPrice: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">ID Kategori (UUID)</label>
              <input 
                required 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs text-primary-700" 
                value={formData.categoryId} 
                onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                placeholder="Tempel ID Kategori di sini..."
              />
            </div>
          </div>

          {/* SEKSI 3: KEBIJAKAN STOK (AI INPUT) */}
          <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 space-y-4">
            <div className="flex items-center gap-2 text-primary-700">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Konfigurasi Stok AI</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Stok Min</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Stok Max</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white" value={formData.maxStock} onChange={e => setFormData({...formData, maxStock: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Lead Time</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white" value={formData.leadTimeDays} onChange={e => setFormData({...formData, leadTimeDays: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Modal - Terpisah dengan background berbeda */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
           <Button 
            type="button"
            variant="ghost" 
            onClick={() => setIsAddModalOpen(false)} 
            className="flex-1 py-4 border border-slate-200 hover:bg-white"
          >
            Batal
          </Button>
           <Button 
            type="submit" 
            className="flex-1 font-bold py-4 shadow-blue-500/20 shadow-lg" 
            disabled={isSubmitting}
          >
             {isSubmitting ? (
               <div className="flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> Menyimpan...</div>
             ) : (
               "Tambah ke Inventaris"
             )}
           </Button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* --- MODAL EDIT PRODUK (VERSI PREMIUM) --- */}
{isEditModalOpen && editFormData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
      
      {/* Header Modal - Warna Biru sesuai tema Edit */}
      <div className="px-8 py-6 border-b border-blue-50 flex justify-between items-center bg-blue-50/30">
        <div>
          <Typography variant="h3" className="text-blue-900 font-bold">Edit Detail Produk</Typography>
          <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
            <Package className="w-3 h-3" /> SKU: {editFormData.sku}
          </p>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(false)} 
          className="p-2 hover:bg-blue-100 rounded-full transition-all"
        >
          <X className="text-blue-400 w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleUpdateProduct}>
        <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto">
          
          {/* SEKSI 1: IDENTITAS BARANG */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
               <Info className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Identitas Barang</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">SKU / Kode Barang</label>
                <input 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed font-mono" 
                  value={editFormData.sku} 
                  disabled // SKU biasanya tidak diubah agar data transaksi tidak rusak
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Produk</label>
                <input 
                  required 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 font-medium" 
                  value={editFormData.name} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* SEKSI 2: HARGA & KATEGORI */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
               <TrendingUp className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Harga & Klasifikasi</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Harga Jual (Rp)</label>
                <input 
                  required type="number" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all text-slate-900 font-bold" 
                  value={editFormData.price} 
                  onChange={e => setEditFormData({...editFormData, price: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Harga Pokok (Rp)</label>
                <input 
                  required type="number" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all text-slate-900 font-bold" 
                  value={editFormData.costPrice} 
                  onChange={e => setEditFormData({...editFormData, costPrice: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">UUID Kategori</label>
              <input 
                required 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-xs text-blue-700" 
                value={editFormData.categoryId} 
                onChange={e => setEditFormData({...editFormData, categoryId: e.target.value})} 
              />
            </div>
          </div>

          {/* TIPS INFORMASI */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
             <p className="text-xs text-blue-700 leading-relaxed">
               Mengubah harga jual akan langsung memengaruhi perhitungan di Dashboard secara real-time. Pastikan data sudah benar sebelum menyimpan.
             </p>
          </div>
        </div>
        
        {/* Footer Modal */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
           <Button 
            type="button"
            variant="ghost" 
            onClick={() => setIsEditModalOpen(false)} 
            className="flex-1 py-4 border border-slate-200 hover:bg-white"
          >
            Batal
          </Button>
           <Button 
            type="submit" 
            className="flex-1 font-bold py-4 shadow-blue-600/20 shadow-lg bg-blue-600 hover:bg-blue-700" 
            disabled={isSubmitting}
          >
             {isSubmitting ? (
               <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> Memproses...</div>
             ) : (
               "Simpan Perubahan"
             )}
           </Button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}