'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/types';
import {
  ChevronLeft,
  Minus,
  Plus,
  Star,
  Clock,
  ShoppingCart,
  Package,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Rating statis konsisten dari id
const getStaticRating = (id: string) => {
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return +(4.2 + (seed % 8) / 10).toFixed(1);
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // ── Fetch produk ───────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setProduct(data);
      })
      .catch(() => {
        toast.error('Produk tidak ditemukan');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Handlers ───────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;
    if (quantity > product.stock) {
      toast.error(`Stok tersisa ${product.stock}`);
      return;
    }
    setAdding(true);
    // Simulasi feedback animasi sebentar
    setTimeout(() => {
      addItem(product, quantity);
      toast.success(`${quantity}× ${product.name} ditambahkan ke keranjang`);
      setAdding(false);
      router.push('/main/cart');
    }, 300);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link disalin ke clipboard');
    }
  };

  const rating = product ? getStaticRating(product.id) : 4.8;

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 animate-pulse">
            <div className="w-full h-80 bg-gray-100" />
            <div className="p-8 space-y-4">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-7 bg-gray-100 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="space-y-2 mt-4">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Produk tidak ditemukan</h2>
          <p className="text-gray-400 text-sm mt-1">
            Produk ini mungkin sudah tidak tersedia
          </p>
          <button
            onClick={() => router.push('/main/products')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Lihat Menu Lainnya
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const isOutOfStock = product.stock === 0;

  // ── Main render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Breadcrumb / Back ──────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Kembali ke Menu
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Bagikan produk"
          >
            <Share2 size={16} />
            Bagikan
          </button>
        </div>

        {/* ── Card utama ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">

          {/* Gambar */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-72 md:h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-700 font-bold px-4 py-2 rounded-full text-sm">
                  Stok Habis
                </span>
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="p-8 flex flex-col">

            {/* Badge kategori + rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-100 text-orange-600 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                {product.category?.name ?? 'Menu'}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">{rating}</span>
              </div>
            </div>

            {/* Nama */}
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={13} />
                15–20 mnt
              </span>
              <span>•</span>
              <span
                className={
                  product.stock > 5
                    ? 'text-green-500 font-medium'
                    : product.stock > 0
                    ? 'text-yellow-500 font-medium'
                    : 'text-red-500 font-medium'
                }
              >
                {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
              </span>
            </div>

            {/* Deskripsi */}
            <p className="mt-4 text-sm text-gray-600 leading-relaxed flex-1">
              {product.description}
            </p>

            {/* ── Quantity Picker ──────────────────────────── */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-gray-700">Jumlah</span>
                <div className="flex items-center gap-3 border border-gray-200 rounded-full px-4 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-5 h-5 flex items-center justify-center text-gray-500
                               hover:text-gray-800 disabled:opacity-30 transition-colors"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-5 h-5 flex items-center justify-center text-gray-500
                               hover:text-gray-800 disabled:opacity-30 transition-colors"
                    aria-label="Tambah jumlah"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Harga + CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                    Total Harga
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {formatRupiah(totalPrice)}
                  </p>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600
                             disabled:bg-gray-300 disabled:cursor-not-allowed
                             text-white font-semibold px-6 py-3 rounded-xl
                             transition-all shadow-sm active:scale-95"
                >
                  <ShoppingCart size={16} />
                  {adding
                    ? 'Menambahkan...'
                    : isOutOfStock
                    ? 'Stok Habis'
                    : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}