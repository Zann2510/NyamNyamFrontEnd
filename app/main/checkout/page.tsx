'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

// Metode pembayaran yang tersedia
const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai (COD)' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'CARD', label: 'Kartu Debit/Kredit' },
] as const;   

type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value'];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotal, clearCart, updateQuantity, removeItem } = useCart();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('OVO');
  const [loading, setLoading] = useState(false);

  // Kalkulasi harga - pastikan semua angka valid
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);
  const deliveryFee = 12_000;
  const taxRate = 0.11;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Alamat pengiriman wajib diisi');
      return;
    }
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
        deliveryAddress: address.trim(),
        paymentMethod,
      });
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      router.push('/main/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  // Kalau keranjang kosong
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Keranjang Kosong</h2>
          <p className="text-gray-400 text-sm mt-1">Tambahkan produk terlebih dahulu</p>
          <button
            onClick={() => router.push('/main/products')}
            className="inline-block mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Lihat Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/main/cart"
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Kembali ke keranjang"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* ── Layout Dua Kolom ─────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* ── Kolom Kiri ──────────────────────────────── */}
            <div className="space-y-5">

              {/* Alamat Pengiriman */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-bold text-gray-900">Alamat Pengiriman</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Selatan (Lobby Utama)"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Catatan Tambahan{' '}
                      <span className="text-gray-400 font-normal">(Opsional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Jangan terlalu pedas, kuah dipisah"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-bold text-gray-900">Metode Pembayaran</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="accent-orange-500"
                      />
                      <span
                        className={`text-sm font-medium ${
                          paymentMethod === method.value
                            ? 'text-orange-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Kolom Kanan: Ringkasan Pesanan ──────────── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Ringkasan Pesanan
              </h2>

              {/* Daftar item */}
              <div className="space-y-3 mb-5">
                {items.map((item) => {
                  const price = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 0;

                  return (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatRupiah(price)}
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, qty - 1)
                          }
                          className="w-6 h-6 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-800">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, qty + 1)
                          }
                          className="w-6 h-6 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Hapus */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-600 ml-1 transition-colors"
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-4" />

              {/* Kalkulasi harga */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
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
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Bayar</span>
                  <span className="font-extrabold text-gray-900 text-lg">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>

              {/* Tombol bayar */}
              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full mt-5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Bayar Sekarang →'
                )}
              </button>

              {!address.trim() && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Isi alamat pengiriman untuk melanjutkan
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}