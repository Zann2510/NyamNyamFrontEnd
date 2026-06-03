'use client';

import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useProductNameCheck } from '@/hooks/useProductNameCheck';

interface ProductNameInputProps {
  value: string;
  onChange: (value: string) => void;
  editingId?: string;       // Isi saat mode edit agar produk itu sendiri tidak dianggap duplikat
  required?: boolean;
  disabled?: boolean;
}

/**
 * Input nama produk dengan validasi real-time ketersediaan nama.
 * Langsung bisa di-drop-in ke form admin create/edit product.
 */
export default function ProductNameInput({
  value,
  onChange,
  editingId,
  required,
  disabled,
}: ProductNameInputProps) {
  const check = useProductNameCheck(value, editingId);

  const borderColor =
    check.status === 'available' ? 'border-green-400 focus:ring-green-300' :
    check.status === 'taken'     ? 'border-red-400 focus:ring-red-300' :
                                   'border-gray-300 focus:ring-orange-300';

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Nama Produk {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          placeholder="cth. Nasi Goreng Spesial"
          className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm
                      focus:outline-none focus:ring-2 transition-colors
                      disabled:bg-gray-50 disabled:text-gray-400
                      ${borderColor}`}
        />

        {/* Ikon status di kanan input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {check.status === 'checking' && (
            <Loader2 size={16} className="text-gray-400 animate-spin" />
          )}
          {check.status === 'available' && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
          {check.status === 'taken' && (
            <XCircle size={16} className="text-red-500" />
          )}
        </div>
      </div>

      {/* Pesan di bawah input */}
      {check.status === 'available' && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 size={11} />
          {check.message}
        </p>
      )}
      {check.status === 'taken' && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <XCircle size={11} />
          {check.message}
        </p>
      )}
      {check.status === 'error' && (
        <p className="mt-1 text-xs text-gray-400">{check.message}</p>
      )}
    </div>
  );
}