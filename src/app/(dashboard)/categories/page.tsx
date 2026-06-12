'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { DataTable } from '@/components/molecules/data-table';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Tag, 
  Loader2, 
  X, 
  Info,
  Layers
} from 'lucide-react';
import apiClient from '@/services/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State untuk Form
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
      
      // PERBAIKAN PATH:
      // response.data (Axios) -> .data (sendSuccess) -> .data (Service findAll)
      const result = response.data.data;
      
      // Pastikan kita mengambil array-nya, baik itu langsung result atau result.data
      const actualArray = Array.isArray(result) ? result : result.data;

      console.log("DATA KATEGORI DITERIMA:", actualArray);
      setCategories(actualArray || []);
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
      setCategories([]); // Fallback ke array kosong jika error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { body: formData };
      await apiClient.post(API_ENDPOINTS.CATEGORIES, payload);
      alert("✅ Kategori berhasil ditambah!");
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error: any) {
      alert("❌ Gagal: " + (error.response?.data?.message || "Error server"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (category: any) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || '' });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { 
        params: { id: editingId },
        body: formData 
      };
      await apiClient.put(`${API_ENDPOINTS.CATEGORIES}/${editingId}`, payload);
      alert("✅ Kategori diperbarui!");
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      alert("❌ Gagal update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus kategori ini? Produk dalam kategori ini akan kehilangan referensi.")) {
      try {
        const config = { data: { params: { id } } };
        await apiClient.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`, config);
        alert("✅ Terhapus");
        fetchCategories();
      } catch (error) {
        alert("❌ Gagal hapus (Mungkin kategori masih digunakan produk)");
      }
    }
  };

  const filteredData = Array.isArray(categories) 
    ? categories.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const columns: any[] = [
    {
      key: 'no',
      header: 'No.',
      render: (_: any, index: number) => <span className="text-slate-400">{index + 1}</span>
    },
    {
      key: 'name',
      header: 'Nama Kategori',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Tag className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-tight">{row.name}</span>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (row: any) => (
        <span className="text-slate-500 text-sm italic">{row.description || '-'}</span>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row: any) => (
        <div className="flex items-center justify-start gap-1">
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
          <Typography variant="h1" className="text-slate-900 font-extrabold tracking-tight text-3xl">Manajemen Kategori</Typography>
          <Typography variant="body" color="secondary">Kelola klasifikasi produk inventaris Anda</Typography>
        </div>
        <Button onClick={() => { setFormData({name:'', description:''}); setIsAddModalOpen(true); }} className="flex gap-2 items-center shadow-lg px-8 py-7 font-bold text-lg">
          <Plus className="h-6 w-6" /> Tambah Kategori
        </Button>
      </div>

      <Card padding="none" className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Cari kategori..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white" 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <p className="text-sm text-slate-500 font-medium">Total: {categories.length} Kategori</p>
        </div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24"><Loader2 className="h-12 w-12 animate-spin text-primary-500 mb-4" /></div>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </div>
      </Card>

      {/* MODAL TAMBAH & EDIT (Reusable Form) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <Typography variant="h3" className="font-bold">{isAddModalOpen ? 'Kategori Baru' : 'Edit Kategori'}</Typography>
               <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}><X className="text-slate-400" /></button>
            </div>
            
            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleUpdateSubmit} className="p-8 space-y-6">
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nama Kategori</label>
                  <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Misal: Minuman Dingin" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Deskripsi (Opsional)</label>
                  <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none" 
                    rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Penjelasan singkat..." />
               </div>
               
               <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="flex-1">Batal</Button>
                  <Button type="submit" className="flex-1 font-bold py-4" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Simpan'}
                  </Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}