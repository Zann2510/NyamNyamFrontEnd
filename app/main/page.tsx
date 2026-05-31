'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/types';
import { Star, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import ProductDetailModal from '@/components/ui/Productdetailmodal';

// ─── Tipe rating statis (karena backend tidak punya rating) ───
const STATIC_RATINGS: Record<number, number> = {
  0: 4.9, 1: 4.9, 2: 4.8, 3: 4.7, 4: 4.6, 5: 4.5, 6: 4.8, 7: 4.7,
};

const PROMO_CARDS = [
  {
    title: 'Diskon 50%',
    subtitle: 'Untuk pengguna baru',
    code: 'BARU50',
    bg: 'bg-blue-500',
    circle: 'bg-blue-400',
  },
  {
    title: 'Gratis Ongkir',
    subtitle: 'Minimal belanja 50rb',
    code: 'ONGKIR0',
    bg: 'bg-purple-500',
    circle: 'bg-purple-400',
  },
  {
    title: 'Buy 1 Get 1',
    subtitle: 'Khusus minuman kopi',
    code: 'KOPI11',
    bg: 'bg-emerald-500',
    circle: 'bg-emerald-400',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    api
      .get('/products?limit=8')
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setProducts(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  // 4 produk pertama untuk "Menu Terfavorit"
  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ── Hero Banner ───────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-2xl bg-orange-500 px-10 py-12 text-white shadow-md"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          }}
        >
          {/* Dekorasi lingkaran */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-52 h-52 bg-orange-400 rounded-full opacity-40" />
          <div className="absolute right-32 top-6 w-24 h-24 bg-orange-300 rounded-full opacity-30" />

          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-extrabold leading-tight">
              Lapar?
              <br />
              Kami Antar{' '}
              <span className="text-yellow-300">Sekarang!</span>
            </h1>
            <p className="mt-3 text-orange-100 text-base">
              Pesan makanan favoritmu dari restoran terbaik di sekitarmu.
            </p>
            <button
              onClick={() => router.push('/main/products')}
              className="mt-6 inline-block bg-white text-orange-500 font-bold px-6 py-3 rounded-full text-sm hover:bg-orange-50 transition-colors shadow-sm"
            >
              Lihat Menu Lengkap
            </button>
          </div>
        </section>

        {/* ── Promo Spesial ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Promo Spesial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROMO_CARDS.map((promo) => (
              <div
                key={promo.code}
                className={`relative overflow-hidden rounded-2xl ${promo.bg} p-5 text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
              >
                {/* Dekorasi */}
                <div className={`absolute right-4 bottom-4 w-24 h-24 ${promo.circle} rounded-full opacity-40`} />
                <div className={`absolute right-12 top-2 w-12 h-12 ${promo.circle} rounded-full opacity-30`} />

                <div className="relative z-10">
                  <p className="text-lg font-bold">{promo.title}</p>
                  <p className="text-sm mt-1 opacity-90">{promo.subtitle}</p>
                  <span className="mt-3 inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {promo.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Menu Terfavorit ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Menu Terfavorit</h2>
            <button
              onClick={() => router.push('/main/products')}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Lihat Semua
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-44 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featured.map((product, idx) => (
                <FavoriteCard
                  key={product.id}
                  product={product}
                  rating={STATIC_RATINGS[idx] ?? 4.7}
                  onOpenDetail={() => setSelectedProduct(product)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Modal Detail Produk ───────────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onViewDetail={() => router.push(`/main/products/${selectedProduct.id}`)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-komponen: Card produk di "Menu Terfavorit"
// ─────────────────────────────────────────────────────────────
interface FavoriteCardProps {
  product: Product;
  rating: number;
  onOpenDetail: () => void;
  onAddToCart: () => void;
}

function FavoriteCard({ product, rating, onOpenDetail, onAddToCart }: FavoriteCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      {/* Gambar */}
      <div className="relative overflow-hidden" onClick={onOpenDetail}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3" onClick={onOpenDetail}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">
          {product.category?.name ?? 'Menu'}
        </p>
        <h3 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Harga + Tombol */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="font-bold text-gray-900 text-sm">
          {formatRupiah(product.price)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          disabled={product.stock === 0}
          className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          aria-label={`Tambah ${product.name} ke keranjang`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}