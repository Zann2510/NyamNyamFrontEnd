'use client';

import { useRouter } from 'next/navigation';
import { Star, Plus } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  rating?: number;
  onOpenDetail?: () => void;
}

/**
 * ProductCard — dipakai di homepage & halaman produk.
 * Navigasi ke detail produk menggunakan useRouter().push()
 * bukan <Link href={`/.../${id}`}> untuk menghindari error
 * "Dynamic href found in <Link>" di Next.js App Router.
 */
export default function ProductCard({
  product,
  rating = 4.8,
  onOpenDetail,
}: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail();
    } else {
      // Navigasi programatik — aman di App Router
      router.push(`/main/products/${product.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Gambar */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
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
          onClick={handleAddToCart}
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