'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { Star, Plus } from 'lucide-react';

// Data promo statis
const PROMO_CARDS = [
  { title: 'Diskon 50%', subtitle: 'Untuk pengguna baru', code: 'BARU50', bg: 'bg-blue-500' },
  { title: 'Gratis Ongkir', subtitle: 'Minimal belanja 50rb', code: 'ONGKIR0', bg: 'bg-purple-500' },
  { title: 'Buy 1 Get 1', subtitle: 'Khusus minuman kopi', code: 'KOPI11', bg: 'bg-emerald-500' },
];

export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?limit=8')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 4);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12 text-white shadow-md">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-extrabold leading-tight">
              Lapar?<br />Kami Antar <span className="text-yellow-300">Sekarang!</span>
            </h1>
            <p className="mt-3 text-orange-100">Pesan makanan favoritmu dari restoran terbaik.</p>
            <button
              onClick={() => router.push('/main/products')}
              className="mt-6 inline-block bg-white text-orange-500 font-bold px-6 py-3 rounded-full text-sm hover:bg-orange-50 transition"
            >
              Lihat Menu Lengkap
            </button>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-52 h-52 bg-orange-400 rounded-full opacity-40" />
        </section>

        {/* Promo Cards */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Promo Spesial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROMO_CARDS.map(promo => (
              <div key={promo.code} className={`${promo.bg} rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer hover:shadow-md transition`}>
                <p className="text-lg font-bold">{promo.title}</p>
                <p className="text-sm mt-1 opacity-90">{promo.subtitle}</p>
                <span className="mt-3 inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">
                  {promo.code}
                </span>
                <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/20 rounded-full opacity-40" />
              </div>
            ))}
          </div>
        </section>

        {/* Menu Terfavorit */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Menu Terfavorit</h2>
            <button onClick={() => router.push('/main/products')} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
              Lihat Semua
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featured.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(e) => handleAddToCart(product, e)}
                  onClick={() => router.push(`/main/products/${product.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Komponen kartu produk untuk beranda
function ProductCard({ product, onAddToCart, onClick }: { product: Product; onAddToCart: (e: React.MouseEvent) => void; onClick: () => void }) {
  const rating = 4.8; // dummy
  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group">
      <div className="relative overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-44 object-cover group-hover:scale-105 transition duration-300" />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{rating}</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">{product.category?.name ?? 'Menu'}</p>
        <h3 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
      </div>
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="font-bold text-gray-900 text-sm">{formatRupiah(product.price)}</span>
        <button onClick={onAddToCart} disabled={product.stock === 0} className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition shadow-sm">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-44 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  );
}