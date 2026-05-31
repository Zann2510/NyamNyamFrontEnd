'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, LogOut, ChevronDown, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Tutup menu saat route berubah
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const navLinks: { href: string; label: string }[] = [
    { href: '/main', label: 'Beranda' },
    { href: '/main/products', label: 'Produk' },
    { href: '/main/profile', label: 'Profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/main') return pathname === '/main';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/main" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg leading-none">N</span>
          </div>
          <span className="text-xl font-bold text-gray-900">NyamNyam</span>
        </Link>

        {/* Desktop Nav Links (hidden di mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Kanan: Cart + Profile + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/main/cart"
            className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Keranjang belanja"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {getItemCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {getItemCount() > 9 ? '9+' : getItemCount()}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button (hanya di mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Profile Desktop (hidden di mobile jika menu mobile terbuka) */}
          {user ? (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-25 truncate hidden sm:block">
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Desktop */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/main/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={15} />
                    Profil Saya
                  </Link>
                  <Link
                    href="/main/orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingBag size={15} />
                    Pesanan Saya
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-50 my-1" />
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-50 my-1" />
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer (slide from right) */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-200 ease-out md:hidden"
          style={{ top: '64px' }}
        >
          <div className="flex flex-col p-4 space-y-4">
            {user ? (
              <div className="border-b pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="block bg-orange-500 text-white text-center py-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 text-base ${isActive(link.href) ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href="/main/orders"
                  className="py-2 text-base text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pesanan Saya
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="py-2 text-base text-orange-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="py-2 text-base text-red-500 text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}