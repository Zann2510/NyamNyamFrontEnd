'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(0);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      // Increment key untuk trigger re-animation
      setAnimKey((k) => k + 1);
    }
  }, [pathname]);

  return (
    <div
      key={animKey}
      className={`page-enter-active ${className}`}
      style={{
        animation: `fadeUp 350ms cubic-bezier(0, 0, 0.2, 1) both`,
      }}
    >
      {children}
    </div>
  );
}