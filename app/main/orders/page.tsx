'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import { Order } from '@/types';
import { Package, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/main/orders/me')
      .then(res => setOrders(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 border-b sticky top-0">
        <h1 className="text-xl font-bold text-center">Pesanan Saya</h1>
      </div>
      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada pesanan</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs text-gray-500">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
              </div>
              <div className="mt-2 text-sm">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>{item.quantity}x {item.product?.name}</span>
                    <span>{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-orange-600">{formatRupiah(order.total)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">Alamat: {order.deliveryAddress}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}