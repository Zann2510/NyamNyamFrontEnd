import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </>
  );
}