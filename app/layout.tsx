import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import AppLoader from '@/components/ui/AppLoader';
import NavigationProgress from '@/components/ui/NavigationProgress';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// themeColor harus di viewport, BUKAN di metadata (Next.js 15+)
export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'NyamNyam — Pesan Makanan Favoritmu',
  description: 'Pesan makanan dari restoran terbaik di sekitarmu. Cepat, mudah, lezat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <AppLoader />
            <NavigationProgress />
            {children}
            <Toaster
              position="top-right"
              gutter={8}
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#1f2937',
                  color: '#f9fafb',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
                success: {
                  iconTheme: { primary: '#39ff14', secondary: '#fff' },
                },
                error: {
                  style: { background: '#7f1d1d' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}