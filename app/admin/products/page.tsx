'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatRupiah } from '@/lib/utils';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
  category?: Category;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
    categoryId: '',
  });
  const [loading, setLoading] = useState(false);

  const extractDataArray = (response: any): any[] => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  };

  const fetchData = async () => {
    try {
      const [productsRes, categoryRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/category'),
      ]);
      setProducts(extractDataArray(productsRes.data));
      setCategory(extractDataArray(categoryRes.data));
    } catch (error) {
      toast.error('Gagal memuat data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error('Gambar produk wajib diupload');
      return;
    }
    setLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, form);
        toast.success('Produk berhasil diperbarui');
      } else {
        await api.post('/products', form);
        toast.success('Produk berhasil ditambahkan');
      }
      setModalOpen(false);
      setEditingProduct(null);
      setForm({ name: '', description: '', price: 0, stock: 0, image: '', categoryId: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produk dihapus');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      categoryId: product.categoryId,
    });
    setModalOpen(true);
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setForm({ name: '', description: '', price: 0, stock: 0, image: '', categoryId: '' });
              setModalOpen(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
              <tr>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{formatRupiah(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-1 rounded-md transition">
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

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Nama Produk</label>
                  <input type="text" required className="w-full border text-gray-800 border-gray-300 rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Deskripsi</label>
                  <textarea rows={3} className="w-full border text-gray-800 border-gray-300 rounded-lg p-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Harga (Rp)</label>
                  <input type="number" required min={0} className="w-full border text-gray-800 border-gray-300 rounded-lg p-2" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Stok</label>
                  <input type="number" required min={0} className="w-full border text-gray-800 border-gray-300 rounded-lg p-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Gambar Produk</label>
                  <ImageUploader
                    onUploadSuccess={(url) => setForm({ ...form, image: url })}
                    currentImage={form.image}
                    onRemove={() => setForm({ ...form, image: '' })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Kategori</label>
                  <select required className="w-full border text-gray-800 border-gray-300 rounded-lg p-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Pilih Kategori</option>
                    {category.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
        </div>
      )}
    </div>
  );
}