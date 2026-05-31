'use client';

import { useEffect, useState } from 'react';
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
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';

// ─── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType; step: number }
> = {
  PENDING: {
    label: 'Menunggu Konfirmasi',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    icon: Clock,
    step: 1,
  },
  CONFIRMED: {
    label: 'Dikonfirmasi',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: ClipboardList,
    step: 2,
  },
  PREPARING: {
    label: 'Sedang Dimasak',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    icon: ChefHat,
    step: 3,
  },
  DELIVERING: {
    label: 'Sedang Diantar',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    icon: Truck,
    step: 4,
  },
  DELIVERED: {
    label: 'Selesai',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircle2,
    step: 5,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
    step: 0,
  },
};

const STEPS = ['CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api
      .get('/orders/me')
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes(o.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
          <div className="h-8 skeleton w-48 mb-6" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-4 skeleton w-32" />
                <div className="h-6 skeleton w-24 rounded-full" />
              </div>
              <div className="h-3 skeleton w-48" />
              <div className="h-px bg-gray-100" />
              <div className="flex gap-3">
                <div className="w-14 h-14 skeleton rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-40" />
                  <div className="h-3 skeleton w-24" />
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
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {orders.length} pesanan total
          </p>
        </div>

        {/* ── Active order banner ──────────────────────────── */}
        {activeOrders.length > 0 && (
          <div
            className="mb-5 bg-orange-500 rounded-2xl p-4 text-white flex items-center gap-3 shadow-md animate-fade-up"
            style={{ animationDelay: '50ms' }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {activeOrders.length} pesanan sedang dalam proses
              </p>
              <p className="text-orange-100 text-xs mt-0.5">
                Estimasi tiba 20–40 menit
              </p>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* ── Filter tabs ──────────────────────────────────── */}
        <div
          className="flex gap-2 mb-5 overflow-x-auto pb-1 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          {[
            { key: 'all', label: 'Semua' },
            { key: 'PENDING', label: 'Menunggu' },
            { key: 'PREPARING', label: 'Dimasak' },
            { key: 'DELIVERING', label: 'Diantar' },
            { key: 'DELIVERED', label: 'Selesai' },
            { key: 'CANCELLED', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Kosong ───────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-9 h-9 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">
              {filter === 'all' ? 'Belum ada pesanan' : `Tidak ada pesanan ${STATUS_CONFIG[filter]?.label ?? ''}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Yuk, pesan makanan favoritmu sekarang!
            </p>
            <button
              onClick={() => router.push('/main/products')}
              className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Lihat Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
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
// Sub-komponen: OrderCard
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
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
  const Icon = config.icon;
  const isCancelled = order.status === 'CANCELLED';
  const isActive = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes(order.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden card-hover">
      {/* Header kartu */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon status */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${config.bg}`}
            >
              <Icon size={16} className={config.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-gray-400">
                #{order.id.slice(-8).toUpperCase()}
              </p>
              <p className={`text-sm font-semibold ${config.color}`}>
                {config.label}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900">{formatRupiah(order.total)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Progress tracker — hanya untuk pesanan aktif */}
        {isActive && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <OrderProgress status={order.status} />
          </div>
        )}

        {/* Preview items (collapsed) */}
        {!expanded && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {order.items?.slice(0, 3).map((item, i) => (
                <div
                  key={item.id}
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                  style={{ zIndex: 3 - i }}
                >
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                      <ShoppingBag size={12} className="text-orange-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {order.items?.length} item
              {(order.items?.length ?? 0) > 3 && ` (+${(order.items?.length ?? 0) - 3} lainnya)`}
            </p>
          </div>
        )}
      </div>

      {/* Tombol expand */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center justify-center gap-1 text-xs text-gray-400
                   hover:bg-gray-50 transition-colors border-t border-gray-50"
      >
        {expanded ? (
          <>Sembunyikan detail <ChevronUp size={13} /></>
        ) : (
          <>Lihat detail <ChevronDown size={13} /></>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-3 border-t border-gray-50"
          style={{ animation: 'fadeUp 200ms ease-out both' }}
        >
          {/* Item list */}
          <div className="space-y-2 pt-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product?.name ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                      <ShoppingBag size={16} className="text-orange-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {item.product?.name ?? 'Produk tidak tersedia'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.quantity}× {formatRupiah(item.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Alamat + metode bayar */}
          <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">Alamat pengiriman</p>
              <p className="leading-relaxed">{order.deliveryAddress}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-0.5">Pembayaran</p>
              <p>{order.paymentMethod}</p>
            </div>
          </div>

          {/* Total breakdown */}
          <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Total Dibayar</span>
            <span className="font-bold text-orange-600">{formatRupiah(order.total)}</span>
          </div>

          {/* Re-order button jika DELIVERED */}
          {order.status === 'DELIVERED' && (
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-orange-500
                         text-orange-600 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              <RotateCcw size={14} />
              Pesan Lagi
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-komponen: Progress tracker visual
// ─────────────────────────────────────────────────────────────
function OrderProgress({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const stepNum = STATUS_CONFIG[step].step;
        const isDone = currentStep >= stepNum;
        const isCurrent = currentStep === stepNum;
        const StepIcon = STATUS_CONFIG[step].icon;

        return (
          <div key={step} className="flex items-center flex-1">
            {/* Node */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                isDone
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-300'
              } ${isCurrent ? 'ring-2 ring-orange-200 ring-offset-1' : ''}`}
            >
              <StepIcon size={11} />
            </div>
            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="h-full bg-orange-500 transition-all duration-700"
                  style={{ width: currentStep > stepNum ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}