'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-20 px-4 py-3 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-orange-600">
        NyamNyam
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-gray-700 hover:text-orange-500">
          Beranda
        </Link>
        <Link href="/main/orders" className="text-gray-700 hover:text-orange-500">
          Pesanan
        </Link>
        <Link href="/cart" className="relative">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.name}</span>
            {isAdmin && (
              <Link href="/admin" className="text-sm bg-orange-100 px-3 py-1 rounded-full">
                Admin
              </Link>
            )}
            <button onClick={logout} className="text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="bg-orange-500 text-white px-4 py-2 rounded-lg">
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t shadow-md p-4 flex flex-col gap-3 md:hidden">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            Beranda
          </Link>
          <Link href="/main/orders" onClick={() => setMobileMenuOpen(false)}>
            Pesanan
          </Link>
          <Link href="/main/cart" onClick={() => setMobileMenuOpen(false)}>
            Keranjang ({getItemCount()})
          </Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name}</span>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-500 text-left">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}