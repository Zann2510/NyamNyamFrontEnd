'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Package, ShoppingBag, Tag, DollarSign } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, categoryRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders/all'),
          api.get('/category'),
        ]);

        const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.data || [];
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
        const categories = Array.isArray(categoryRes.data) ? categoryRes.data : categoryRes.data?.data || [];

        const totalRevenue = orders
          .filter((o: Order) => o.status === 'DELIVERED')
          .reduce((sum: number, o: Order) => sum + o.total, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalCategories: categories.length,
          totalRevenue,
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Gagal memuat data dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    DELIVERING: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Produk', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Pesanan', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
    { title: 'Kategori', value: stats.totalCategories, icon: Tag, color: 'bg-purple-500' },
    { title: 'Pendapatan', value: formatRupiah(stats.totalRevenue), icon: DollarSign, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between transition hover:shadow-lg">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full text-white`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pesanan Terbaru */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Pesanan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
              <tr>
                <th className="px-6 py-3">ID Pesanan</th>
                <th className="px-6 py-3">Pelanggan</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-mono text-gray-700">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{order.user?.name || 'Tamu'}</td>
                    <td className="px-6 py-3 font-semibold text-gray-800">{formatRupiah(order.total)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}