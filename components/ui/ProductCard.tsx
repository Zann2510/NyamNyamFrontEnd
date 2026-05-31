import Link from 'next/link';
import { Star } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  horizontal?: boolean;
  rating?: number; // opsional, karena backend tidak punya rating
}

export default function ProductCard({ product, horizontal = false, rating = 4.8 }: ProductCardProps) {
  if (horizontal) {
    return (
      <Link
        href={`/products/${product.id}`}
        className="flex bg-white rounded-xl shadow-sm p-3 gap-3 hover:shadow-md transition"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-gray-600">{rating}</span>
          </div>
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
          <p className="text-orange-600 font-bold mt-1">{formatRupiah(product.price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/main/products/${product.id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
    >
      <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
      <div className="p-2">
        <div className="flex items-center gap-1 text-xs text-yellow-500">
          <Star className="w-3 h-3 fill-current" />
          <span>{rating}</span>
        </div>
        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
        <p className="text-orange-600 font-bold text-sm mt-1">
          {formatRupiah(product.price)}
        </p>
      </div>
    </Link>
  );
}