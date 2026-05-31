'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Package, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Perbaikan: gunakan endpoint yang benar
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/user/profile'),   // bukan /auth/me
          api.get('/orders/me'),
        ]);
        setProfile(profileRes.data.data || profileRes.data);
        setOrders(ordersRes.data.data || ordersRes.data);
      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat data profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
    else setLoading(false);
  }, [user]);

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

      {/* Informasi Profil */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 p-2 rounded-full">
            <User className="text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold">Data Diri</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nama Lengkap</p>
            <p className="font-medium">{profile?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{profile?.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telepon</p>
            <p className="font-medium">{profile?.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium">{profile?.role === 'ADMIN' ? 'Administrator' : 'Pelanggan'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="font-medium">{profile?.address || '-'}</p>
          </div>
        </div>
      </div>

      {/* Riwayat Pesanan */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-orange-600" />
          <h2 className="text-lg font-semibold">Riwayat Pesanan</h2>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada pesanan</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-mono text-sm">#{order.id.slice(-8)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="font-bold text-orange-600">{formatRupiah(order.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tombol Logout */}
      <button
        onClick={logout}
        className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition"
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}