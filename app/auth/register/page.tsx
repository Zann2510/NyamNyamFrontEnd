'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600">Daftar Akun</h1>
          <p className="text-gray-500 mt-1">Bergabung dengan NyamNyam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="pl-10 text-gray-800 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Budi Santoso"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="pl-10 text-gray-800 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="budi@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="pl-10 text-gray-800 pr-10 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Minimal 6 karakter"
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

          {/* Telepon (opsional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon <span className="text-gray-400 text-xs">(Opsional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="pl-10 text-gray-800 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="08123456789"
              />
            </div>
          </div>

          {/* Alamat (opsional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat <span className="text-gray-400 text-xs">(Opsional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-800 w-5 h-5" />
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                className="pl-10 text-gray-800 w-full border border-gray-800 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Jl. Contoh No. 123, Jakarta"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-orange-500 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}