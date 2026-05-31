'use client';

/**
 * AppLoader
 * Splash screen yang muncul hanya sekali saat pertama kali app dibuka.
 * Setelah selesai, disimpan ke sessionStorage agar tidak muncul lagi
 * selama tab masih terbuka.
 */

import { useEffect, useState } from 'react';

export default function AppLoader() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    // Cek apakah sudah pernah load dalam session ini
    const alreadyLoaded = sessionStorage.getItem('nn_loaded');
    if (alreadyLoaded) return;

    setShow(true);

    // Timeline animasi:
    // 0ms    → logo muncul (enter)
    // 900ms  → tahan sebentar (hold)
    // 1400ms → mulai exit
    // 1900ms → selesai, sembunyikan

    const t1 = setTimeout(() => setPhase('hold'), 900);
    const t2 = setTimeout(() => setPhase('exit'), 1400);
    const t3 = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('nn_loaded', '1');
    }, 1900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      style={{
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 500ms ease-in-out' : 'none',
        pointerEvents: 'none',
      }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo animasi */}
        <div
          className="relative"
          style={{
            animation: phase === 'enter' ? 'scaleIn 500ms cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
          }}
        >
          {/* Ring pulse di belakang logo */}
          <div
            className="absolute inset-0 rounded-full bg-orange-200"
            style={{
              animation: 'pulse-ring 1.2s ease-out infinite',
              animationDelay: '400ms',
            }}
          />
          {/* Logo bulat */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
            <span className="text-white font-black text-4xl leading-none select-none">N</span>
          </div>
        </div>

        {/* Nama brand */}
        <div
          style={{
            animation: 'fadeUp 400ms ease-out 300ms both',
          }}
        >
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            Nyam<span className="text-orange-500">Nyam</span>
          </p>
          <p className="text-sm text-gray-400 text-center mt-0.5 font-medium">
            Pesan. Tunggu. Nikmati.
          </p>
        </div>

        {/* Loading dots */}
        <div
          className="flex items-center gap-2 mt-2"
          style={{ animation: 'fadeIn 300ms ease-out 700ms both' }}
        >
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    </div>
  );
}