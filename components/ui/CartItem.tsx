'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-orange-600 font-bold mt-1">
          {formatRupiah(item.price)}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 border rounded-full px-2 py-1">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={item.quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={item.quantity >= item.stock}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            className="text-red-500 p-1 hover:bg-red-50 rounded-full"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}