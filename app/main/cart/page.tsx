'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getItemCount } = useCart();

  // Kalkulasi yang aman dari NaN
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
  }, 0);
  const deliveryFee = 12_000;
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700">Keranjang Kosong</h2>
          <p className="text-gray-400 mt-1 text-sm">Yuk, pesan makanan favoritmu!</p>
          <button
            onClick={() => router.push('/main/products')}
            className="inline-flex items-center gap-2 mt-5 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Lihat Menu
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/main"
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keranjang Saya</h1>
            <p className="text-sm text-gray-400">{getItemCount()} item</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* ── Daftar Item ──────────────────────────────── */}
          <div className="space-y-3">
            {items.map((item) => {
              const price = Number(item.price) || 0;
              const qty = Number(item.quantity) || 0;
              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-orange-500 font-bold mt-0.5">{formatRupiah(price)}</p>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5">
                    <button
                      onClick={() => updateQuantity(item.productId, qty - 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
                      disabled={qty <= 1}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-gray-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, qty + 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
                      disabled={item.stock ? qty >= item.stock : false}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal item */}
                  <div className="text-right min-w-20">
                    <p className="text-sm font-bold text-gray-900">
                      {formatRupiah(price * qty)}
                    </p>
                  </div>

                  {/* Hapus */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label={`Hapus ${item.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Ringkasan Harga ─────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">Ringkasan Harga</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({getItemCount()} item)</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pajak (11%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-gray-900 text-lg">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/main/checkout')}
              className="mt-5 flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-sm"
            >
              Lanjut ke Checkout
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => router.push('/main/products')}
              className="mt-3 flex items-center justify-center w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              + Tambah Menu Lainnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}