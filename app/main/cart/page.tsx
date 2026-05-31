'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCart();
  const subtotal = getTotal();
  const deliveryFee = 12000;
  const tax = subtotal * 0.11;
  const total = subtotal + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold">Keranjang Kosong</h2>
        <p className="text-gray-500">Yuk, pesan makanan favoritmu!</p>
        <Link href="/" className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full">Lihat Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white p-4 border-b sticky top-0">
        <h1 className="text-xl font-bold text-center">Keranjang Saya</h1>
        <p className="text-center text-sm text-gray-500">{getItemCount()} item</p>
      </div>

      <div className="p-4 space-y-4">
        {items.map(item => (
          <div key={item.productId} className="bg-white rounded-xl p-3 flex gap-3 shadow">
            <img src={item.image} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-orange-600 font-bold">{formatRupiah(item.price)}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2 border rounded-full px-2 py-1">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus size={16} /></button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus size={16} /></button>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg rounded-t-2xl">
        <div className="space-y-2">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Biaya Pengiriman</span><span>{formatRupiah(deliveryFee)}</span></div>
          <div className="flex justify-between text-sm"><span>Pajak (11%)</span><span>{formatRupiah(Math.round(tax))}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total Bayar</span><span className="text-orange-600">{formatRupiah(Math.round(total))}</span></div>
          <Link href="/checkout" className="block w-full bg-orange-500 text-white text-center py-3 rounded-full font-semibold">Lanjut ke Checkout →</Link>
        </div>
      </div>
    </div>
  );
}