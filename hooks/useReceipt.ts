'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ReceiptInfo {
  orderId: string;
  receiptNumber: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  items: ReceiptItem[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
}

interface UseReceiptReturn {
  receiptInfo: ReceiptInfo | null;
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
  fetchReceipt: (orderId: string) => Promise<void>;
  downloadPdf: (orderId: string, receiptNumber?: string) => Promise<void>;
  clearReceipt: () => void;
}

export function useReceipt(): UseReceiptReturn {
  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bersihkan object URL lama untuk mencegah memory leak
  const revokeOldUrl = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  }, [pdfUrl]);

  const fetchReceipt = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    revokeOldUrl();

    try {
      // Fetch keduanya secara paralel untuk performa optimal
      const [infoRes, pdfRes] = await Promise.all([
        // JSON info receipt
        api.get(`/receipt/info/${orderId}`),
        // PDF sebagai Blob — KUNCI: responseType: 'blob'
        api.get(`/receipt/generate/${orderId}`, {
          responseType: 'blob',
        }),
      ]);

      // Unwrap TransformInterceptor wrapper
      const info: ReceiptInfo = infoRes.data?.data?.data ?? infoRes.data?.data ?? infoRes.data;
      setReceiptInfo(info);

      // Buat Object URL dari blob PDF
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Gagal memuat struk';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [revokeOldUrl]);

  // Download langsung tanpa buka modal
  const downloadPdf = useCallback(async (orderId: string, receiptNumber?: string) => {
    try {
      const res = await api.get(`/receipt/generate/${orderId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `struk_${receiptNumber ?? orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup setelah 1 detik
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      throw new Error(err?.response?.data?.message ?? 'Gagal mengunduh struk');
    }
  }, []);

  const clearReceipt = useCallback(() => {
    revokeOldUrl();
    setReceiptInfo(null);
    setPdfUrl(null);
    setError(null);
  }, [revokeOldUrl]);

  return { receiptInfo, pdfUrl, loading, error, fetchReceipt, downloadPdf, clearReceipt };
}