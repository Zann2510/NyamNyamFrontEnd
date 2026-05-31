'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Order } from '@/types';
import {
  Package, Clock, CheckCircle2, XCircle, Truck, ChefHat, ClipboardList,
  ChevronDown, ChevronUp, RotateCcw, ShoppingBag
} from 'lucide-react';

const STATUS_CONFIG: Record<string, any> = {
  PENDING: { label: 'Menunggu Konfirmasi', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: Clock, step: 1 },
  CONFIRMED: { label: 'Dikonfirmasi', color: 'text-blue-700', bg: 'bg-blue-50', icon: ClipboardList, step: 2 },
  PREPARING: { label: 'Sedang Dimasak', color: 'text-purple-700', bg: 'bg-purple-50', icon: ChefHat, step: 3 },
  DELIVERING: { label: 'Sedang Diantar', color: 'text-indigo-700', bg: 'bg-indigo-50', icon: Truck, step: 4 },
  DELIVERED: { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle2, step: 5 },
  CANCELLED: { label: 'Dibatalkan', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle, step: 0 },
};

const STEPS = ['CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.get('/orders/me')
      .then(res => {
        const data = res.data?.data ?? res.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes(o.status));

  if (loading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
        <p className="text-sm text-gray-400 mb-6">{orders.length} pesanan total</p>

        {activeOrders.length > 0 && (
          <div className="mb-5 bg-orange-500 rounded-2xl p-4 text-white flex items-center gap-3 shadow-md">
            <Truck size={20} />
            <div className="flex-1">
              <p className="font-semibold text-sm">{activeOrders.length} pesanan sedang dalam proses</p>
              <p className="text-orange-100 text-xs">Estimasi tiba 20–40 menit</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {['all', 'PENDING', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'].map(key => (
            <button key={key} onClick={() => setFilter(key)} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${filter === key ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {key === 'all' ? 'Semua' : STATUS_CONFIG[key]?.label || key}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24">
            <Package className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold">Belum ada pesanan</p>
            <button onClick={() => router.push('/main/products')} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl">Lihat Menu</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} expanded={expandedId === order.id} onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, expanded, onToggle }: any) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  const isActive = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes(order.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${config.bg}`}>
              <Icon size={16} className={config.color} />
            </div>
            <div>
              <p className="text-xs font-mono text-gray-400">#{order.id.slice(-8)}</p>
              <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{formatRupiah(order.total)}</p>
            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        {isActive && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              {STEPS.map((step, idx) => {
                const stepNum = STATUS_CONFIG[step].step;
                const isDone = (config.step || 0) >= stepNum;
                const StepIcon = STATUS_CONFIG[step].icon;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                      <StepIcon size={11} />
                    </div>
                    {idx < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-1 rounded-full bg-gray-100"><div className={`h-full bg-green-500 transition-all duration-700`} style={{ width: isDone ? '100%' : '0%' }} /></div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!expanded && (
          <div className="mt-3 flex gap-2">
            {order.items?.slice(0, 3).map((item: any, i: number) => (
              <div key={item.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                <img src={item.product?.image} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <p className="text-xs text-gray-500">{order.items?.length} item</p>
          </div>
        )}
      </div>

      <button onClick={onToggle} className="w-full px-4 py-2 text-xs text-gray-400 hover:bg-gray-50 border-t">
        {expanded ? 'Sembunyikan detail' : 'Lihat detail'} <ChevronDown size={13} className="inline" />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.product?.image} className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product?.name}</p>
                <p className="text-xs text-gray-400">{item.quantity}× {formatRupiah(item.price)}</p>
              </div>
              <p className="text-sm font-semibold">{formatRupiah(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="pt-3 border-t text-sm">
            <p><strong>Alamat:</strong> {order.deliveryAddress}</p>
            <p><strong>Metode:</strong> {order.paymentMethod}</p>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-orange-600">{formatRupiah(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}