'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Package, ShoppingBag, Tag, DollarSign, TrendingUp, Calendar, ArrowUp } from 'lucide-react';

interface Summary {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  topProducts: {
    id: string;
    name: string;
    price: number;
    image: string;
    totalSold: number;
  }[];
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string };
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil endpoint summary dan orders/all secara paralel
        const [summaryRes, ordersRes] = await Promise.all([
          api.get('/orders/summary'),
          api.get('/orders/all'),
        ]);

        setSummary(summaryRes.data);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
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

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Gagal memuat ringkasan</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pesanan',
      value: summary.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Pendapatan',
      value: formatRupiah(summary.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pesanan Hari Ini',
      value: summary.todayOrders,
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Pendapatan Minggu Ini',
      value: formatRupiah(summary.weeklyRevenue),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between transition hover:shadow-lg"
            >
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

      {/* Top 5 Produk Terlaris */}
      {summary.topProducts && summary.topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Produk Terlaris</h2>
          <div className="space-y-3">
            {summary.topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4 p-3 border-b last:border-0">
                <span className="text-lg font-bold text-gray-400 w-6">{idx + 1}</span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">Terjual {product.totalSold} pcs</p>
                </div>
                <p className="font-bold text-orange-600">{formatRupiah(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perbandingan Pendapatan */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Perbandingan Pendapatan</h2>
        <div className="flex justify-between items-center gap-4">
          <div className="text-center flex-1 bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Minggu Ini</p>
            <p className="text-xl font-bold text-gray-800">{formatRupiah(summary.weeklyRevenue)}</p>
          </div>
          <ArrowUp size={24} className="text-gray-400" />
          <div className="text-center flex-1 bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Bulan Ini</p>
            <p className="text-xl font-bold text-gray-800">{formatRupiah(summary.monthlyRevenue)}</p>
          </div>
        </div>
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
                    <td className="px-6 py-3 font-mono text-gray-700">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {order.user?.name || 'Tamu'}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </td>
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