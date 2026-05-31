'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 12000;
  const tax = subtotal * 0.11;
  const total = subtotal + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return toast.error('Alamat pengiriman wajib diisi');
    if (!user) return toast.error('Silakan login terlebih dahulu');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod,
      });
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white p-4 border-b sticky top-0"><h1 className="text-xl font-bold text-center">Checkout</h1></div>
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div className="bg-white p-4 rounded-xl">
          <label className="font-semibold">Alamat Pengiriman <span className="text-red-500">*</span></label>
          <textarea required rows={3} className="w-full border rounded-lg p-2 mt-1" value={address} onChange={e => setAddress(e.target.value)} placeholder="Jl. Sudirman No. 45, Jakarta Selatan" />
        </div>
        <div className="bg-white p-4 rounded-xl">
          <label className="font-semibold">Catatan Tambahan</label>
          <textarea rows={2} className="w-full border rounded-lg p-2 mt-1" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: Jangan terlalu pedas" />
        </div>
        <div className="bg-white p-4 rounded-xl">
          <label className="font-semibold block mb-2">Metode Pembayaran</label>
          {['CASH', 'QRIS', 'CARD'].map(m => (
            <label key={m} className="flex items-center gap-2"><input type="radio" name="payment" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} /> {m === 'CASH' ? 'COD' : m}</label>
          ))}
        </div>
        <div className="bg-white p-4 rounded-xl">
          <h2 className="font-semibold mb-2">Ringkasan Pesanan</h2>
          {items.map(i => <div key={i.productId} className="flex justify-between text-sm"><span>{i.name} x{i.quantity}</span><span>{formatRupiah(i.price * i.quantity)}</span></div>)}
          <hr className="my-2" />
          <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
          <div className="flex justify-between"><span>Pengiriman</span><span>{formatRupiah(deliveryFee)}</span></div>
          <div className="flex justify-between"><span>Pajak 11%</span><span>{formatRupiah(Math.round(tax))}</span></div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"><span>Total</span><span className="text-orange-600">{formatRupiah(Math.round(total))}</span></div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold disabled:opacity-50">{loading ? 'Memproses...' : 'Bayar Sekarang →'}</button>
      </form>
    </div>
  );
}