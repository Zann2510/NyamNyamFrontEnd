'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo dan judul */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600">NyamNyam</h1>
          <p className="text-gray-500 mt-2">Login ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 text-gray-800 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="admin@kuliner.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 text-gray-800 pr-10 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {/* Link ke register */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-orange-500 font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>

        {/* Demo credentials (untuk memudahkan penilai) */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
          <p>Demo Akun Admin: admin@kuliner.com / admin123</p>
          <p>Demo Akun Customer: customer@example.com / user123</p>
        </div>
      </div>
    </div>
  );
}