'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/types';
import { Search, Star } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
  api.get('/main/products?limit=20').then(res => {
    // TransformInterceptor: res.data = { success, statusCode, data: { data: [...], meta } }
    const payload = res.data.data;
    const list = Array.isArray(payload) ? payload : payload?.data ?? [];
    setProducts(list);
  }).catch(console.error);
}, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  // Ambil 4 produk pertama untuk rekomendasi
  const recommended = filteredProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold">Lapar? 🍔</h1>
        <p className="mt-1">Pesan makanan favoritmu, kami antar cepat!</p>
        <Link href="/main/products" className="inline-block mt-3 bg-white text-orange-500 px-4 py-2 rounded-full text-sm font-semibold shadow">
          Lihat Menu Lengkap →
        </Link>
      </div>

      {/* Search bar */}
      <div className="px-4 -mt-4">
        <div className="relative bg-white rounded-full shadow-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari makanan atau restoran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Promo banner */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-3">
        <div className="bg-red-100 p-3 rounded-xl">
          <p className="font-bold text-red-700">Diskon 50%</p>
          <p className="text-xs">Pengguna baru</p>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full mt-1 inline-block">BARU50</span>
        </div>
        <div className="bg-green-100 p-3 rounded-xl">
          <p className="font-bold text-green-700">Gratis Ongkir</p>
          <p className="text-xs">Min belanja 50rb</p>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full mt-1 inline-block">ONGKIR0</span>
        </div>
      </div>

      {/* Menu Terfavorit */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Menu Terfavorit 🔥</h2>
          <Link href="/products" className="text-orange-500 text-sm">Lihat Semua</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          {recommended.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Semua Produk */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold mb-3">Menu Lainnya</h2>
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} horizontal />
          ))}
        </div>
      </div>
    </div>
  );
}