'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

interface NameCheckResult {
  status: 'idle' | 'checking' | 'available' | 'taken' | 'error';
  message: string;
}

/**
 * Hook untuk cek ketersediaan nama produk secara real-time.
 *
 * Cara pakai:
 *   const { status, message } = useProductNameCheck(name, excludeId);
 *
 * @param name      - nilai input nama produk (dari state form)
 * @param excludeId - ID produk yang sedang diedit (kosongkan untuk mode create)
 * @param delay     - debounce delay dalam ms (default 450)
 */
export function useProductNameCheck(
  name: string,
  excludeId?: string,
  delay = 450,
): NameCheckResult {
  const [result, setResult] = useState<NameCheckResult>({
    status: 'idle',
    message: '',
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Reset ke idle jika nama kosong
    if (!name.trim()) {
      setResult({ status: 'idle', message: '' });
      return;
    }

    setResult({ status: 'checking', message: '' });

    const timer = setTimeout(async () => {
      // Batalkan request sebelumnya jika masih berlangsung
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const params: Record<string, string> = { name: name.trim() };
        if (excludeId) params.excludeId = excludeId;

        const res = await api.get('/products/check-name', { params });
        const data = res.data?.data ?? res.data;

        setResult({
          status: data.available ? 'available' : 'taken',
          message: data.message,
        });
      } catch (err: any) {
        // Abaikan AbortError — bukan error nyata
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setResult({ status: 'error', message: 'Gagal memeriksa nama' });
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [name, excludeId, delay]);

  return result;
}