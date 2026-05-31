'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Product } from '@/types';
import { ChevronLeft, Minus, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/main/products/${id}`)
      .then(res => setProduct(res.data.data || res.data))
      .catch(() => toast.error('Produk tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (quantity > product.stock) {
      toast.error(`Stok tersisa ${product.stock}`);
      return;
    }
    addItem(product, quantity);
    toast.success(`${quantity} ${product.name} ditambahkan`);
    router.push('/main/cart');
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Produk tidak tersedia</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b p-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()}><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-semibold">Detail Produk</h1>
      </div>

      <img src={product.image} alt={product.name} className="w-full h-72 object-cover" />

      <div className="p-4">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-500">{product.category?.name} • 15-20 mnt</div>
            <h2 className="text-2xl font-bold mt-1">{product.name}</h2>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-semibold">4.9</span>
          </div>
        </div>

        <p className="text-gray-600 mt-3">{product.description}</p>
        <p className="text-sm text-gray-500 mt-1">Stok: {product.stock}</p>

        <div className="mt-6 flex justify-between items-center">
          <span className="font-semibold">Jumlah</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-8 h-8 border rounded-full flex items-center justify-center">
              <Minus size={16} />
            </button>
            <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(product.stock, q+1))} className="w-8 h-8 border rounded-full flex items-center justify-center">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Total</span>
            <p className="text-2xl font-bold text-orange-600">{formatRupiah(product.price * quantity)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold disabled:bg-gray-300"
          >
            + Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}