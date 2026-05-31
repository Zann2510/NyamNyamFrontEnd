'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string };
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: OrderItem[];
}

const statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  DELIVERING: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const extractDataArray = (response: any): any[] => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      const ordersData = extractDataArray(res.data);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      toast.error('Gagal memuat pesanan');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter(
          (o) =>
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.deliveryAddress.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, orders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status pesanan diperbarui');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Semua Pesanan</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari pesanan (ID, nama, alamat)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          Tidak ada pesanan ditemukan
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center gap-3 bg-gray-50">
                <div>
                  <p className="font-mono text-sm text-gray-600"># {order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border border-gray-300 rounded-lg p-1 text-sm bg-white focus:ring-orange-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    {expandedId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Pelanggan</p>
                  <p className="font-medium text-gray-800">{order.user?.name || 'Tidak diketahui'}</p>
                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Alamat Pengiriman</p>
                  <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pembayaran</p>
                  <p className="font-medium text-gray-800">{order.paymentMethod}</p>
                  <p className="text-orange-600 font-bold mt-1">{formatRupiah(order.total)}</p>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <p className="font-semibold text-gray-800 mb-2">Detail Pesanan:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 text-gray-600">
                        <tr>
                          <th className="text-left py-2">Produk</th>
                          <th className="text-center">Jumlah</th>
                          <th className="text-right">Harga</th>
                          <th className="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-200 last:border-0">
                            <td className="py-2 text-gray-800">{item.product?.name || 'Produk tidak tersedia'}</td>
                            <td className="text-center text-gray-700">{item.quantity}</td>
                            <td className="text-right text-gray-700">{formatRupiah(item.price)}</td>
                            <td className="text-right font-medium text-gray-800">{formatRupiah(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td colSpan={3} className="text-right py-2 text-gray-800">Total</td>
                          <td className="text-right text-orange-600">{formatRupiah(order.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}