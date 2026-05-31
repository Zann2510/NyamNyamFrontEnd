'use client';

import { useState } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  skeletonClassName?: string;
}

/**
 * SmartImage
 * Gambar dengan:
 * - Skeleton placeholder saat loading
 * - Fade-in smooth saat gambar selesai load
 * - Fallback placeholder jika gambar error
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  fallback,
  skeletonClassName,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const displaySrc = hasError
    ? (fallback ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=fed7aa&color=ea580c`)
    : src;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: '#f3f4f6' }}>
      {/* Skeleton shimmer saat belum load */}
      {!loaded && (
        <div
          className={`absolute inset-0 skeleton ${skeletonClassName ?? ''}`}
        />
      )}
      <img
        {...props}
        src={displaySrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => { setHasError(true); setLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  );
}