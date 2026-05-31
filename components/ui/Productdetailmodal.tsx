'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, Clock, ExternalLink } from 'lucide-react';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  initialRating?: number;
  /** Opsional: dipanggil saat user klik "Lihat halaman penuh" */
  onViewDetail?: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  initialRating = 4.9,
  onViewDetail,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Tutup dengan Escape + lock scroll
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = () => {
    if (quantity > product.stock) {
      toast.error(`Stok tersisa ${product.stock}`);
      return;
    }
    addItem(product, quantity);
    toast.success(`${quantity}× ${product.name} ditambahkan ke keranjang`);
    onClose();
  };

  const isOutOfStock = product.stock === 0;
  const totalPrice = product.price * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden
                      w-full max-w-2xl max-h-[90vh] flex flex-col sm:flex-row">

        {/* ── Kiri: Gambar ───────────────────────────────── */}
        <div className="w-full sm:w-[46%] shrink-0 bg-gray-100 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 sm:h-full object-cover"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 font-bold px-3 py-1.5 rounded-full text-sm">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* ── Kanan: Detail ──────────────────────────────── */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">

          {/* Tombol close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white rounded-full shadow-md
                       hover:bg-gray-50 transition-colors z-10"
            aria-label="Tutup"
          >
            <X size={18} className="text-gray-600" />
          </button>

          {/* Badge kategori + rating */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-orange-100 text-orange-600 text-[11px] font-bold
                             uppercase tracking-wide px-2.5 py-1 rounded-full">
              {product.category?.name ?? 'Menu'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">{initialRating}</span>
            </div>
          </div>

          {/* Nama */}
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {product.name}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              15–20 mnt
            </span>
            <span>•</span>
            <span className="text-gray-500 font-medium">Terlaris</span>
          </div>

          {/* Deskripsi */}
          <p className="mt-4 text-sm text-gray-600 leading-relaxed flex-1">
            {product.description}
          </p>

          {/* Link ke halaman penuh (opsional) */}
          {onViewDetail && (
            <button
              onClick={onViewDetail}
              className="flex items-center gap-1 mt-3 text-xs text-gray-400
                         hover:text-orange-500 transition-colors w-fit"
            >
              <ExternalLink size={12} />
              Lihat halaman penuh
            </button>
          )}

          {/* ── Quantity ─────────────────────────────────── */}
          <div className="flex items-center justify-between mt-5">
            <span className="text-sm font-semibold text-gray-700">Jumlah</span>
            <div className="flex items-center gap-3 border border-gray-200 rounded-full px-3 py-1.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-6 h-6 flex items-center justify-center text-gray-500
                           hover:text-gray-800 disabled:opacity-30 transition-colors"
                aria-label="Kurangi"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || isOutOfStock}
                className="w-6 h-6 flex items-center justify-center text-gray-500
                           hover:text-gray-800 disabled:opacity-30 transition-colors"
                aria-label="Tambah"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ── Total + CTA ──────────────────────────────── */}
          <div className="flex items-center justify-between mt-5">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                Total Harga
              </p>
              <p className="text-xl font-extrabold text-gray-900">
                {formatRupiah(totalPrice)}
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600
                         disabled:bg-gray-300 disabled:cursor-not-allowed
                         text-white font-semibold px-5 py-3 rounded-xl
                         transition-all shadow-sm active:scale-95 text-sm"
            >
              <ShoppingCart size={16} />
              {isOutOfStock ? 'Stok Habis' : 'Tambah Pesanan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}