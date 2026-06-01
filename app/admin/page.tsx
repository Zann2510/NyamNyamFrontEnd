'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import {
  Package,
  ShoppingBag,
  Tag,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowRight,
  RefreshCcw,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────
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

// Normalisasi berbagai bentuk response backend
const normArr = (res: any): any[] => {
  const d = res.data?.data ?? res.data;
  return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
};

const normObj = (res: any): any => {
  return res.data?.data ?? res.data ?? {};
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:         'bg-yellow-100 text-yellow-800',
  CONFIRMED:       'bg-blue-100 text-blue-800',
  PREPARING:       'bg-purple-100 text-purple-800',
  DELIVERING:      'bg-indigo-100 text-indigo-800',
  DELIVERED:       'bg-green-100 text-green-800',
  CANCELLED:       'bg-red-100 text-red-800',
  WAITING_PAYMENT: 'bg-orange-100 text-orange-800',
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setSummaryError(false);

    // Fetch orders/all — selalu dibutuhkan
    let orders: Order[] = [];
    try {
      const ordersRes = await api.get('/orders/all');
      orders = normArr(ordersRes);
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Gagal fetch orders/all:', err);
    }

    // Fetch summary — endpoint terpisah, fallback ke hitung manual dari orders
    try {
      const summaryRes = await api.get('/orders/summary');
      const data = normObj(summaryRes);

      // Validasi response punya field yang dibutuhkan
      if (typeof data?.totalOrders === 'number') {
        setSummary(data);
      } else {
        throw new Error('Response summary tidak valid');
      }
    } catch (err) {
      console.warn('Endpoint /orders/summary gagal, hitung dari orders lokal:', err);
      setSummaryError(true);

      // Fallback: hitung dari data orders yang sudah kita punya
      if (orders.length > 0) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const delivered = orders.filter((o) => o.status === 'DELIVERED');

        setSummary({
          totalOrders: orders.length,
          totalRevenue: delivered.reduce((s, o) => s + (Number(o.total) || 0), 0),
          todayOrders: orders.filter(
            (o) => new Date(o.createdAt) >= startOfDay
          ).length,
          weeklyRevenue: delivered
            .filter((o) => new Date(o.createdAt) >= startOfWeek)
            .reduce((s, o) => s + (Number(o.total) || 0), 0),
          monthlyRevenue: delivered
            .filter((o) => new Date(o.createdAt) >= startOfMonth)
            .reduce((s, o) => s + (Number(o.total) || 0), 0),
          topProducts: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Stat cards — pakai summary kalau ada, otherwise zeros
  const statCards = [
    {
      title: 'Total Pesanan',
      value: summary?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Pendapatan',
      value: formatRupiah(summary?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pesanan Hari Ini',
      value: summary?.todayOrders ?? 0,
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Pendapatan Minggu Ini',
      value: formatRupiah(summary?.weeklyRevenue ?? 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800
                     px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>

      {/* Banner jika summary dihitung secara lokal */}
      {summaryError && summary && (
        <div className="mb-5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3
                        flex items-center gap-2 text-sm text-yellow-700">
          <span>⚠️</span>
          <span>
            Endpoint <code className="font-mono text-xs bg-yellow-100 px-1 rounded">/orders/summary</code>
            {' '}belum tersedia — statistik dihitung dari data pesanan lokal.
            Pastikan route <code className="font-mono text-xs bg-yellow-100 px-1 rounded">GET summary</code>
            {' '}didefinisikan <strong>sebelum</strong>{' '}
            <code className="font-mono text-xs bg-yellow-100 px-1 rounded">GET :id</code> di controller.
          </span>
        </div>
      )}

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between
                         hover:shadow-lg transition-shadow"
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

      {/* ── Top Produk Terlaris ──────────────────────────────── */}
      {summary?.topProducts && summary.topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top {summary.topProducts.length} Produk Terlaris
          </h2>
          <div className="space-y-1">
            {summary.topProducts.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
              >
                <span className="text-base font-bold text-gray-300 w-6 text-center">
                  {idx + 1}
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">
                    Terjual {product.totalSold} pcs
                  </p>
                </div>
                <p className="font-bold text-orange-600 shrink-0">
                  {formatRupiah(product.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Perbandingan Pendapatan ──────────────────────────── */}
      {summary && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Ringkasan Pendapatan
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Minggu Ini', value: summary.weeklyRevenue },
              { label: 'Bulan Ini', value: summary.monthlyRevenue },
              { label: 'Total', value: summary.totalRevenue },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-base font-bold text-gray-800">
                  {formatRupiah(item.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pesanan Terbaru ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Pesanan Terbaru</h2>
          <a
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            Lihat semua <ArrowRight size={14} />
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada pesanan masuk</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">ID Pesanan</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-gray-600 text-xs">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {order.user?.name || 'Tamu'}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {formatRupiah(Number(order.total) || 0)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}