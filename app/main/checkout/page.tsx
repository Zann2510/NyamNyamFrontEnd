'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Data dummy bank untuk metode debit/transfer
const banks = [
  { name: 'BCA', accountNumber: '1234567890', accountName: 'NyamNyam Food' },
  { name: 'Mandiri', accountNumber: '9876543210', accountName: 'NyamNyam Food' },
  { name: 'BNI', accountNumber: '5678901234', accountName: 'NyamNyam Food' },
  { name: 'BRI', accountNumber: '4321098765', accountName: 'NyamNyam Food' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [selectedBank, setSelectedBank] = useState(banks[0]);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 menit dalam detik
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 12000;
  const tax = subtotal * 0.11;
  const total = subtotal + deliveryFee + tax;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      toast.error('Waktu upload bukti habis! Silakan refresh halaman.');
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Mulai timer ketika metode pembayaran bukan COD
  useEffect(() => {
    if (paymentMethod !== 'CASH') {
      setTimerActive(true);
      setTimeLeft(120);
    } else {
      setTimerActive(false);
      setTimeLeft(0);
      setPaymentProofUrl(''); // tidak perlu bukti untuk COD
    }
  }, [paymentMethod]);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diizinkan');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = res.data.url;
      setPaymentProofUrl(imageUrl);
      toast.success('Bukti pembayaran berhasil diupload');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal upload bukti');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Alamat pengiriman wajib diisi');
      return;
    }
    if (items.length === 0) {
      toast.error('Keranjang kosong');
      router.push('/');
      return;
    }
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    // Validasi untuk metode non-COD
    if (paymentMethod !== 'CASH') {
      if (!paymentProofUrl) {
        toast.error('Silakan upload bukti pembayaran terlebih dahulu');
        return;
      }
      if (timeLeft === 0) {
        toast.error('Waktu upload telah habis, silakan refresh dan coba lagi');
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod: paymentMethod,
        paymentProofUrl: paymentMethod !== 'CASH' ? paymentProofUrl : undefined,
      };
      await api.post('/orders', orderData);
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 bg-white p-4 border-b shadow-sm z-10">
        <h1 className="text-xl font-bold text-center">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Alamat pengiriman */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-semibold block mb-1">
            Alamat Pengiriman <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            className="w-full border rounded-lg p-2"
            placeholder="Jl. Sudirman No. 45, Jakarta Selatan"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Metode Pembayaran */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-semibold block mb-2">Metode Pembayaran</label>
          <div className="space-y-2">
            {[
              { value: 'CASH', label: 'COD (Cash on Delivery)' },
              { value: 'QRIS', label: 'QRIS (OVO/GoPay/Dana)' },
              { value: 'CARD', label: 'Transfer Bank / Debit' },
            ].map((method) => (
              <label key={method.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-orange-500"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tampilan khusus berdasarkan metode */}
        {paymentMethod === 'QRIS' && (
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="font-semibold mb-2">Scan QRIS di bawah ini untuk membayar</p>
            <div className="flex justify-center">
              <img
                src="/images/qris.png" // ganti dengan file gambar QRIS Anda
                alt="QRIS Code"
                className="w-48 h-48 object-contain border rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Setelah scan, upload bukti pembayaran di bawah</p>
          </div>
        )}

        {paymentMethod === 'CARD' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="font-semibold mb-2">Pilih Bank Tujuan Transfer</p>
            <select
              className="w-full border rounded-lg p-2 mb-3"
              value={selectedBank.name}
              onChange={(e) => setSelectedBank(banks.find(b => b.name === e.target.value) || banks[0])}
            >
              {banks.map((bank) => (
                <option key={bank.name} value={bank.name}>{bank.name}</option>
              ))}
            </select>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">Nomor Rekening: <span className="font-mono font-bold">{selectedBank.accountNumber}</span></p>
              <p className="text-sm">Atas Nama: {selectedBank.accountName}</p>
              <p className="text-xs text-gray-500 mt-1">Total yang harus ditransfer: <span className="font-bold">{formatRupiah(Math.round(total))}</span></p>
            </div>
          </div>
        )}

        {/* Upload Bukti (hanya untuk non-COD) */}
        {paymentMethod !== 'CASH' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">Upload Bukti Pembayaran</label>
              <span className={`text-sm font-mono ${timeLeft < 30 ? 'text-red-500' : 'text-gray-600'}`}>
                Sisa waktu: {formatTime(timeLeft)}
              </span>
            </div>
            {paymentProofUrl ? (
              <div className="relative inline-block">
                <img src={paymentProofUrl} alt="Bukti" className="h-24 rounded-md" />
                <button
                  type="button"
                  onClick={() => setPaymentProofUrl('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" onChange={handleUploadProof} disabled={uploading || timeLeft === 0} className="hidden" />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {uploading ? 'Mengupload...' : 'Klik untuk upload bukti transfer / screenshot QRIS'}
                </div>
              </label>
            )}
            {timeLeft === 0 && <p className="text-red-500 text-sm mt-2">Waktu habis! Silakan refresh halaman.</p>}
          </div>
        )}

        {/* Ringkasan pesanan */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-3">Ringkasan Pesanan</h2>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm py-1">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatRupiah(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
          <div className="flex justify-between"><span>Biaya Kirim</span><span>{formatRupiah(deliveryFee)}</span></div>
          <div className="flex justify-between"><span>Pajak (11%)</span><span>{formatRupiah(Math.round(tax))}</span></div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span className="text-orange-600">{formatRupiah(Math.round(total))}</span>
          </div>
        </div>

        {/* Tombol bayar */}
        <button
          type="submit"
          disabled={loading || (paymentMethod !== 'CASH' && !paymentProofUrl) || (paymentMethod !== 'CASH' && timeLeft === 0)}
          className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Bayar Sekarang →'}
        </button>
      </form>
    </div>
  );
}