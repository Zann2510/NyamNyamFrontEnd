'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

export default function AdminCategory() {
  const [category, setCategory] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon: '' });
  const [loading, setLoading] = useState(false);

  const extractDataArray = (response: any): any[] => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  };

  const fetchCategory = async () => {
    try {
      const res = await api.get('/category');
      setCategory(extractDataArray(res.data));
    } catch (error) {
      toast.error('Gagal memuat kategori');
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/category/${editingCategory.id}`, form);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await api.post('/category', form);
        toast.success('Kategori berhasil ditambahkan');
      }
      setModalOpen(false);
      setEditingCategory(null);
      setForm({ name: '', icon: '' });
      fetchCategory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/category/${id}`);
      toast.success('Kategori dihapus');
      fetchCategory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, icon: cat.icon || '' });
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Kategori</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', icon: '' });
            setModalOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
              <tr>
                <th className="px-6 py-3">Nama Kategori</th>
                <th className="px-6 py-3">Ikon</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {category.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Belum ada kategori</td>
                </tr>
              ) : (
                category.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-6 py-3 text-gray-600">{cat.icon || '-'}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cat)} className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:bg-red-50 p-1 rounded-md transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ikon (opsional, misal: 🍔)</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2" placeholder="🍔" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}