'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCart();

  const navItems = [
    { href: '/main', label: 'Beranda', icon: Home },
    { href: '/main/orders', label: 'Pesanan', icon: ShoppingBag },
    { href: '/main/cart', label: 'Keranjang', icon: ShoppingCart, badge: getItemCount() },
    { href: '/main/profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 md:hidden z-10">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
              isActive ? 'text-orange-500' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <Icon size={22} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}