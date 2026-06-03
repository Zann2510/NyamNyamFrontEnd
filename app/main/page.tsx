'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import { Star, Plus, Flame, TrendingUp } from 'lucide-react';
import ProductDetailModal from '@/components/ui/Productdetailmodal';

const PROMO_CARDS = [
  { title: 'Diskon 50%', subtitle: 'beli setengah harga doang', code: 'UNTUK PENGGUNA BARU', bg: 'bg-blue-500', circle: 'bg-blue-400' },
  { title: 'Gratis Ongkir', subtitle: 'Minimal belanja 50rb', code: 'ONGKIR Rp.0', bg: 'bg-purple-500', circle: 'bg-purple-400' },
  { title: 'Buy 1 Get 1', subtitle: 'Khusus minuman kopi', code: 'DAPET 2', bg: 'bg-emerald-500', circle: 'bg-emerald-400' },
];

const ratingCache: Record<string, number> = {};
const getStaticRating = (id: string) => {
  if (!ratingCache[id]) {
    const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    ratingCache[id] = +(4.2 + (seed % 8) / 10).toFixed(1);
  }
  return ratingCache[id];
};


const normProductArray = (res: any): Product[] => {
  const outer = res.data?.data ?? res.data;          
  if (Array.isArray(outer)) return outer;            
  if (Array.isArray(outer?.data)) return outer.data;
  return [];
};

interface TopProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  totalSold: number;
  // Diperkaya dengan data produk lengkap setelah fetch
  description?: string;
  stock?: number;
  categoryId?: string;
  category?: { id: string; name: string };
}

export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredSource, setFeaturedSource] = useState<'sales' | 'latest' | 'loading'>('loading');
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    api.get('/products?limit=8')
      .then(res => {
        const list = normProductArray(res);
        setAllProducts(list);
      })
      .catch(err => console.error('Fetch products error:', err));
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);

      try {
        // Strategi 1: coba ambil dari endpoint summary (top produk by sales)
        const summaryRes = await api.get('/orders/summary');
        const summaryData = summaryRes.data?.data ?? summaryRes.data;
        const topProducts: TopProduct[] = summaryData?.topProducts ?? [];

        if (topProducts.length >= 2) {
          // Ambil detail lengkap produk (deskripsi, stok, kategori)
          const enriched = await Promise.all(
            topProducts.slice(0, 4).map(async (tp) => {
              try {
                const prodRes = await api.get(`/products/${tp.id}`);
                const detail = prodRes.data?.data ?? prodRes.data;
                return { ...detail, totalSold: tp.totalSold } as Product;
              } catch {
                // Kalau detail gagal, pakai data minimal dari summary
                return {
                  id: tp.id,
                  name: tp.name,
                  price: tp.price,
                  image: tp.image,
                  description: `Terjual ${tp.totalSold} porsi`,
                  stock: 99,
                  categoryId: '',
                  category: undefined,
                } as Product;
              }
            })
          );
          setFeaturedProducts(enriched);
          setFeaturedSource('sales');
          return;
        }
      } catch {
      }

      // Strategi 2 (fallback): 4 produk terbaru
      try {
        const res = await api.get('/products?limit=4&sortBy=createdAt&sortOrder=desc');
        const list = normProductArray(res);
        if (list.length > 0) {
          setFeaturedProducts(list.slice(0, 4));
          setFeaturedSource('latest');
          return;
        }
      } catch {
      }

      // Strategi 3: pakai allProducts yang sudah ada
      setFeaturedProducts(allProducts.slice(0, 4));
      setFeaturedSource('latest');
    };

    const timer = setTimeout(() => {
      fetchFeatured().finally(() => setLoadingFeatured(false));
    }, 100);
    return () => clearTimeout(timer);
  }, [allProducts]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Stok habis');
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* ── Hero Banner ──────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-2xl px-10 py-12 text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
        >
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-52 h-52 bg-orange-400 rounded-full opacity-40" />
          <div className="absolute right-32 top-6 w-24 h-24 bg-orange-300 rounded-full opacity-30" />
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-extrabold leading-tight">
              Lapar?<br />
              Kami Antar <span className="text-yellow-300">Sekarang!</span>
            </h1>
            <p className="mt-3 text-orange-100 text-base">
              Pesan makanan favoritmu dari restoran terbaik di sekitarmu.
            </p>
            <button
              onClick={() => router.push('/main/products')}
              className="mt-6 inline-block bg-white text-orange-500 font-bold px-6 py-3 rounded-full text-sm hover:bg-orange-50 transition-colors shadow-sm">
              Lihat Menu Lengkap
            </button>
          </div>
        </section>

        {/* ── Promo Spesial ─────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Promo Spesial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROMO_CARDS.map((promo) => (
              <div
                key={promo.code}
                className={`relative overflow-hidden rounded-2xl ${promo.bg} p-5 text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
                <div className={`absolute right-4 bottom-4 w-24 h-24 ${promo.circle} rounded-full opacity-40`} />
                <div className={`absolute right-12 top-2 w-12 h-12 ${promo.circle} rounded-full opacity-30`} />
                <div className="relative z-10">
                  <p className="text-lg font-bold">{promo.title}</p>
                  <p className="text-sm mt-1 opacity-90">{promo.subtitle}</p>
                  <span className="mt-3 inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">
                    {promo.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Menu Terfavorit ───────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Menu Terfavorit</h2>
              {/* Badge sumber data */}
              {featuredSource === 'sales' && (
                <span className="flex items-center gap-1 bg-orange-100 text-orange-600
                                 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <Flame size={10} />
                  Terlaris
                </span>
              )}
              {featuredSource === 'latest' && (
                <span className="flex items-center gap-1 bg-blue-100 text-blue-600
                                 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} />
                  Terbaru
                </span>
              )}
            </div>
            <button
              onClick={() => router.push('/main/products')}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Lihat Semua
            </button>
          </div>

          {loadingFeatured ? (
            // Skeleton loading
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-44 bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="flex justify-between mt-3">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="w-8 h-8 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            // Empty state — produk belum ada
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Belum ada menu terfavorit</p>
              <p className="text-gray-400 text-sm mt-1">
                Menu akan muncul setelah ada produk dan transaksi
              </p>
              <button
                onClick={() => router.push('/main/products')}
                className="mt-4 text-sm text-orange-500 font-semibold hover:underline"
              >
                Lihat semua menu →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredProducts.map((product, idx) => (
                <FeaturedCard
                  key={product.id}
                  product={product}
                  rating={getStaticRating(product.id)}
                  rank={featuredSource === 'sales' ? idx + 1 : undefined}
                  onOpenDetail={() => setSelectedProduct(product)}
                  onAddToCart={(e) => handleAddToCart(product, e)}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Modal Detail ─────────────────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          initialRating={getStaticRating(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onViewDetail={() => {
            router.push(`/main/products/${selectedProduct.id}`);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FeaturedCard — kartu produk di section Menu Terfavorit
// ─────────────────────────────────────────────────────────────
interface FeaturedCardProps {
  product: Product;
  rating: number;
  rank?: number;        // nomor urut penjualan (1 = terlaris)
  onOpenDetail: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

function FeaturedCard({ product, rating, rank, onOpenDetail, onAddToCart }: FeaturedCardProps) {
  return (
    <div
      onClick={onOpenDetail}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md
                 transition-shadow cursor-pointer group"
    >
      {/* Gambar */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=fed7aa&color=ea580c&size=200`;
          }}
        />
        {/* Badge rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90
                        backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{rating}</span>
        </div>
        {/* Badge rank terlaris */}
        {rank && rank <= 3 && (
          <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5
                           rounded-full text-[10px] font-bold shadow-sm ${
                             rank === 1
                               ? 'bg-yellow-400 text-yellow-900'
                               : rank === 2
                               ? 'bg-gray-300 text-gray-700'
                               : 'bg-orange-300 text-orange-900'
                           }`}>
            #{rank}
          </div>
        )}
        {/* Overlay stok habis */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">
          {product.category?.name ?? 'Menu'}
        </p>
        <h3 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Harga + tombol */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="font-bold text-gray-900 text-sm">
          {formatRupiah(product.price)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(e);
          }}
          disabled={product.stock === 0}
          className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300
                     text-white rounded-full flex items-center justify-center
                     transition-colors shadow-sm"
          aria-label={`Tambah ${product.name}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}