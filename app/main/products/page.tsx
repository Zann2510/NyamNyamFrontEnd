'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Search, Star, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';
import ProductDetailModal from '@/components/ui/Productdetailmodal';

// Rating statis per produk (konsisten selama session)
const ratingCache: Record<string, number> = {};
const getStaticRating = (id: string) => {
  if (!ratingCache[id]) {
    // Seed dari id agar konsisten tiap render
    const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    ratingCache[id] = +(4.2 + (seed % 8) / 10).toFixed(1);
  }
  return ratingCache[id];
};

export default function ProductsPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ── Fetch data ─────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=50'),
          api.get('/category'),
        ]);

        // Normalisasi berbagai bentuk response dari backend
        const normArr = (res: any): any[] => {
          const d = res.data?.data ?? res.data;
          return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
        };

        setProducts(normArr(prodRes));
        setCategories(normArr(catRes));
      } catch (err) {
        toast.error('Gagal memuat produk');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Filter produk ──────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q);
      const matchCat =
        activeCategory === 'all' || p.categoryId === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, activeCategory]);

  // ── Handlers ───────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (product: Product, e: React.MouseEvent) => {
      e.stopPropagation();
      if (product.stock === 0) {
        toast.error('Stok habis');
        return;
      }
      addItem(product, 1);
      toast.success(`${product.name} ditambahkan ke keranjang`);
    },
    [addItem]
  );

  const handleCardClick = useCallback(
    (product: Product) => {
      // Buka modal — UX lebih smooth daripada navigasi halaman
      setSelectedProduct(product);
    },
    []
  );

  const handleViewDetail = useCallback(
    (product: Product) => {
      // Navigasi programatik ke halaman detail (router.push aman di App Router)
      router.push(`/main/products/${product.id}`);
    },
    [router]
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Search + Filter ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari makanan..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                         text-gray-800 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                         transition shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryPill
              label="Semua"
              active={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.name}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Jumlah hasil */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-4">
            {filtered.length} menu ditemukan
            {activeCategory !== 'all' &&
              ` di ${categories.find((c) => c.id === activeCategory)?.name}`}
            {search && ` untuk "${search}"`}
          </p>
        )}

        {/* ── Grid Produk ─────────────────────────────────── */}
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState
            search={search}
            onReset={() => { setSearch(''); setActiveCategory('all'); }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rating={getStaticRating(product.id)}
                onCardClick={handleCardClick}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Detail ────────────────────────────────────── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          initialRating={getStaticRating(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onViewDetail={() => handleViewDetail(selectedProduct)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-komponen
// ─────────────────────────────────────────────────────────────

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
        active
          ? 'bg-gray-900 text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
      }`}
    >
      {label}
    </button>
  );
}

interface ProductCardProps {
  product: Product;
  rating: number;
  onCardClick: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

function ProductCard({ product, rating, onCardClick, onAddToCart }: ProductCardProps) {
  return (
    <div
      onClick={() => onCardClick(product)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md
                 transition-shadow cursor-pointer group"
    >
      {/* Gambar */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1
                        bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{rating}</span>
        </div>
        {/* Badge stok habis */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500 mb-1">
          {product.category?.name ?? 'Menu'}
        </p>
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Harga + tombol */}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-gray-900">{formatRupiah(product.price)}</span>
          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={product.stock === 0}
            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200
                       text-white rounded-full flex items-center justify-center
                       transition-colors shadow-sm"
            aria-label={`Tambah ${product.name}`}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="w-full h-52 bg-gray-100" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="flex justify-between items-center mt-3">
              <div className="h-5 bg-gray-100 rounded w-1/3" />
              <div className="w-8 h-8 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  search,
  onReset,
}: {
  search: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-gray-600 font-medium">
        {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada produk di kategori ini'}
      </p>
      <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain atau ubah filter</p>
      <button
        onClick={onReset}
        className="mt-4 text-sm text-orange-500 hover:text-orange-600 font-semibold"
      >
        Reset filter
      </button>
    </div>
  );
}