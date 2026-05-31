'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Saat pathname berubah — selesaikan bar
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;

      clearTimers();
      setProgress(100);

      // Sembunyikan setelah selesai
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }
  }, [pathname]);

  // Simulasi progress saat loading (dipanggil dari link clicks)
  const startProgress = () => {
    clearTimers();
    setProgress(0);
    setVisible(true);

    // Naik cepat ke 70% lalu melambat
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += current < 50 ? 8 : current < 70 ? 3 : current < 85 ? 1 : 0.3;
      if (current >= 90) {
        clearInterval(intervalRef.current!);
        current = 90;
      }
      setProgress(current);
    }, 80);
  };

  // Listen ke klik link untuk mulai progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      if (href === pathname) return;

      startProgress();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  // Cleanup
  useEffect(() => {
    return () => clearTimers();
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      id="nprogress-bar"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        transition: progress === 100
          ? 'width 200ms ease-out, opacity 300ms ease 200ms'
          : 'width 80ms linear',
      }}
    />
  );
}