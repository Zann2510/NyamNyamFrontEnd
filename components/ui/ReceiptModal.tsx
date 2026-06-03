'use client';

import { useEffect, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Receipt,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { ReceiptInfo } from '@/hooks/useReceipt';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  receiptInfo: ReceiptInfo | null;
  pdfUrl: string | null;
  onDownload: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DELIVERED:  { label: 'Selesai',         color: 'text-green-600 bg-green-50',   icon: <CheckCircle2 size={14} /> },
  CONFIRMED:  { label: 'Dikonfirmasi',    color: 'text-blue-600 bg-blue-50',     icon: <CheckCircle2 size={14} /> },
  PREPARING:  { label: 'Diproses',        color: 'text-amber-600 bg-amber-50',   icon: <Clock size={14} /> },
  DELIVERING: { label: 'Dikirim',         color: 'text-purple-600 bg-purple-50', icon: <Clock size={14} /> },
  PENDING:    { label: 'Menunggu',        color: 'text-gray-600 bg-gray-100',    icon: <Clock size={14} /> },
  CANCELLED:  { label: 'Dibatalkan',      color: 'text-red-600 bg-red-50',       icon: <AlertCircle size={14} /> },
  WAITING_PAYMENT: { label: 'Belum Bayar', color: 'text-orange-600 bg-orange-50', icon: <CreditCard size={14} /> },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tunai (COD)',
  QRIS: 'QRIS',
  CARD: 'Transfer Bank',
};

export default function ReceiptModal({
  isOpen,
  onClose,
  loading,
  error,
  receiptInfo,
  pdfUrl,
  onDownload,
}: ReceiptModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Lock scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  if (!isOpen) return null;

  const status = receiptInfo ? STATUS_CONFIG[receiptInfo.status] ?? STATUS_CONFIG.PENDING : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        style={{ animation: 'slideUp 280ms cubic-bezier(0.32,0.72,0,1)' }}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Receipt size={16} className="text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Struk Pembayaran</h2>
              {receiptInfo && (
                <p className="text-xs text-gray-400">{receiptInfo.receiptNumber}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={36} className="text-orange-500 animate-spin" />
              <p className="text-gray-500 text-sm">Menyiapkan struk...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <p className="font-semibold text-gray-800">Gagal memuat struk</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          )}

          {/* Content: info kiri + PDF kanan (layout 2 kolom di desktop) */}
          {!loading && !error && receiptInfo && (
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

              {/* ── Kiri: Detail Pesanan ─────────────────── */}
              <div className="lg:w-80 flex-shrink-0 p-5 space-y-5">
                {/* Status badge */}
                {status && (
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>
                )}

                {/* Info customer */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Informasi Pelanggan
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{receiptInfo.customerName}</p>
                  {receiptInfo.customerEmail && (
                    <p className="text-xs text-gray-500 mt-0.5">{receiptInfo.customerEmail}</p>
                  )}
                </div>

                {/* Info transaksi */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Detail Transaksi
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">No. Struk</span>
                      <span className="font-mono text-xs text-gray-700 font-medium">
                        {receiptInfo.receiptNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal</span>
                      <span className="text-gray-700">
                        {new Date(receiptInfo.date).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pembayaran</span>
                      <span className="text-gray-700">
                        {PAYMENT_METHOD_LABEL[receiptInfo.paymentMethod ?? ''] ?? receiptInfo.paymentMethod ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item list */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Item Pesanan
                  </p>
                  <div className="space-y-2">
                    {receiptInfo.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity}× {formatRupiah(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800 flex-shrink-0">
                          {formatRupiah(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-gray-900 text-lg">
                      {formatRupiah(receiptInfo.total)}
                    </span>
                  </div>
                </div>

                {/* Aksi di mobile — tampil di sini, di desktop di footer */}
                <div className="lg:hidden flex flex-col gap-2 pt-1">
                  <ActionButtons onDownload={onDownload} onPrint={handlePrint} hasPdf={!!pdfUrl} />
                </div>
              </div>

              {/* ── Kanan: Preview PDF ───────────────────── */}
              <div className="flex-1 flex flex-col">
                <div className="px-5 py-3 border-b border-gray-50 flex-shrink-0">
                  <p className="text-xs text-gray-400 font-medium">Preview Struk</p>
                </div>
                {pdfUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={pdfUrl}
                    className="flex-1 w-full"
                    style={{ minHeight: '400px', border: 'none' }}
                    title="Struk PDF"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center py-16 text-gray-300">
                    <div className="text-center">
                      <Receipt size={40} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">PDF tidak tersedia</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: tombol aksi (hanya desktop) ─────────── */}
        {!loading && !error && receiptInfo && (
          <div className="hidden lg:flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <ActionButtons onDownload={onDownload} onPrint={handlePrint} hasPdf={!!pdfUrl} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ActionButtons({
  onDownload,
  onPrint,
  hasPdf,
}: {
  onDownload: () => void;
  onPrint: () => void;
  hasPdf: boolean;
}) {
  return (
    <>
      {hasPdf && (
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Printer size={15} />
          Print
        </button>
      )}
      <button
        onClick={onDownload}
        disabled={!hasPdf}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white text-sm font-semibold transition-colors shadow-sm"
      >
        <Download size={15} />
        Unduh PDF
      </button>
    </>
  );
}