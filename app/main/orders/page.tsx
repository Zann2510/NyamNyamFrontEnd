'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Order } from '@/types';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  RefreshCcw,
} from 'lucide-react';

// ─── Status Config — LENGKAP sesuai Prisma OrderStatus enum ───
// Prisma enum: PENDING, WAITING_PAYMENT, CONFIRMED, PREPARING,
//              DELIVERING, DELIVERED, CANCELLED
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
    step: number;
  }
> = {
  PENDING: {
    label: 'Menunggu Konfirmasi',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: Clock,
    step: 1,
  },
  WAITING_PAYMENT: {
    label: 'Menunggu Pembayaran',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: CreditCard,
    step: 1,
  },
  CONFIRMED: {
    label: 'Dikonfirmasi',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: ClipboardList,
    step: 2,
  },
  PREPARING: {
    label: 'Sedang Dimasak',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: ChefHat,
    step: 3,
  },
  DELIVERING: {
    label: 'Sedang Diantar',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: Truck,
    step: 4,
  },
  DELIVERED: {
    label: 'Selesai',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle2,
    step: 5,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    step: 0,
  },
};

// Fallback untuk status tak dikenal — tidak crash
const DEFAULT_STATUS = {
  label: 'Status Tidak Dikenal',
  color: 'text-gray-600',
  bg: 'bg-gray-50',
  border: 'border-gray-200',
  icon: Package,
  step: 0,
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? DEFAULT_STATUS;

// Step yang ditampilkan di progress bar
const PROGRESS_STEPS = ['CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED'];

// Status yang dianggap "aktif / dalam proses"
const ACTIVE_STATUSES = [
  'PENDING',
  'WAITING_PAYMENT',
  'CONFIRMED',
  'PREPARING',
  'DELIVERING',
];

// Tab filter
const FILTER_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'WAITING_PAYMENT', label: 'Bayar' },
  { key: 'CONFIRMED', label: 'Dikonfirmasi' },
  { key: 'PREPARING', label: 'Dimasak' },
  { key: 'DELIVERING', label: 'Diantar' },
  { key: 'DELIVERED', label: 'Selesai' },
  { key: 'CANCELLED', label: 'Dibatalkan' },
];

// Normalisasi response array
const normArr = (res: any): any[] => {
  const d = res.data?.data ?? res.data;
  return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    // Coba beberapa kemungkinan endpoint
    const endpoints = ['/orders/me', '/main/orders/me', '/orders'];
    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        const data = normArr(res);
        setOrders(data);
        return;
      } catch (err: any) {
        if (err.response?.status === 404) continue;
        console.error('Orders fetch error:', err);
        return;
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, [fetchOrders]);

  // Hitung tab yang aktif saja (sembunyikan tab yang tidak ada datanya)
  const tabsWithCount = FILTER_TABS.map((tab) => ({
    ...tab,
    count:
      tab.key === 'all'
        ? orders.length
        : orders.filter((o) => o.status === tab.key).length,
  })).filter((tab) => tab.key === 'all' || tab.count > 0);

  const filtered =
    filter === 'all'
      ? orders
      : orders.filter((o) => o.status === filter);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));

  // ── Loading skeleton ─────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-6" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-full bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-24" />
                    <div className="h-4 bg-gray-100 rounded w-36" />
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="h-4 bg-gray-100 rounded w-20" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {orders.length} pesanan total
            </p>
          </div>
          <button
            onClick={() => fetchOrders(true).finally(() => setRefreshing(false))}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800
                       px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors mt-1"
          >
            <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ── Banner pesanan aktif ─────────────────────────── */}
        {activeOrders.length > 0 && (
          <div className="mb-5 bg-orange-500 rounded-2xl p-4 text-white flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {activeOrders.length} pesanan sedang dalam proses
              </p>
              <p className="text-orange-100 text-xs mt-0.5">
                Estimasi tiba 20–40 menit
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Filter tabs (scroll horizontal di mobile) ────── */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {tabsWithCount.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                         whitespace-nowrap transition-all flex-shrink-0 ${
                           filter === tab.key
                             ? 'bg-gray-900 text-white shadow-sm'
                             : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                         }`}
            >
              {tab.label}
              {tab.count > 0 && tab.key !== 'all' && (
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.5 leading-none ${
                    filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Empty state ──────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-9 h-9 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">
              {filter === 'all' ? 'Belum ada pesanan' : `Tidak ada pesanan ${getStatusConfig(filter).label}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Yuk, pesan makanan favoritmu sekarang!
            </p>
            <button
              onClick={() => router.push('/main/products')}
              className="mt-5 bg-orange-500 hover:bg-orange-600 text-white
                         px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Lihat Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() =>
                  setExpandedId(expandedId === order.id ? null : order.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OrderCard
// ─────────────────────────────────────────────────────────────
function OrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Gunakan getStatusConfig agar tidak crash untuk status tak dikenal
  const config = getStatusConfig(order.status);
  const Icon = config.icon;
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* ── Header kartu ──────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Kiri: icon + status */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center
                          flex-shrink-0 border ${config.bg} ${config.border}`}
            >
              <Icon size={16} className={config.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-gray-400 truncate">
                #{order.id.slice(-8).toUpperCase()}
              </p>
              <p className={`text-sm font-semibold ${config.color}`}>
                {config.label}
              </p>
            </div>
          </div>

          {/* Kanan: total + tanggal */}
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900 text-sm">
              {formatRupiah(Number(order.total) || 0)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Progress bar — hanya untuk pesanan aktif non-cancelled */}
        {isActive && !isCancelled && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              {PROGRESS_STEPS.map((step, idx) => {
                const stepCfg = STATUS_CONFIG[step];
                const currentStep = config.step;
                const isDone = currentStep >= stepCfg.step;
                const isCurrent = currentStep === stepCfg.step;
                const StepIcon = stepCfg.icon;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center
                                  flex-shrink-0 transition-all duration-500 ${
                                    isDone
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-gray-100 text-gray-300'
                                  } ${isCurrent ? 'ring-2 ring-orange-200 ring-offset-1' : ''}`}
                    >
                      <StepIcon size={11} />
                    </div>
                    {idx < PROGRESS_STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-700"
                          style={{ width: currentStep > stepCfg.step ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview items (collapsed) */}
        {!expanded && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {(order.items ?? []).slice(0, 3).map((item: any, i: number) => (
                <div
                  key={item.id ?? i}
                  className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex-shrink-0"
                  style={{ zIndex: 3 - i }}
                >
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product?.name ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                      <ShoppingBag size={10} className="text-orange-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              {(order.items ?? []).length} item
              {(order.items?.length ?? 0) > 3 &&
                ` (+${(order.items?.length ?? 0) - 3} lainnya)`}
            </p>
          </div>
        )}
      </div>

      {/* ── Toggle button ─────────────────────────────── */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center justify-center gap-1
                   text-xs text-gray-400 hover:bg-gray-50 transition-colors
                   border-t border-gray-50"
      >
        {expanded ? (
          <>Sembunyikan detail <ChevronUp size={13} /></>
        ) : (
          <>Lihat detail <ChevronDown size={13} /></>
        )}
      </button>

      {/* ── Expanded detail ───────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          {/* Item list */}
          <div className="space-y-2 pt-3">
            {(order.items ?? []).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product?.name ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                      <ShoppingBag size={14} className="text-orange-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {item.product?.name ?? 'Produk tidak tersedia'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.quantity}× {formatRupiah(Number(item.price) || 0)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {formatRupiah((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                </p>
              </div>
            ))}
          </div>

          {/* Info pengiriman + pembayaran */}
          <div className="pt-3 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">Alamat Pengiriman</p>
              <p className="leading-relaxed">{order.deliveryAddress}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">Metode Pembayaran</p>
              <p>{order.paymentMethod}</p>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Total Dibayar</span>
            <span className="font-bold text-orange-600">
              {formatRupiah(Number(order.total) || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}