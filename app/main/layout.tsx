import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNavbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pb-20 md:pb-8">{children}</main>
      <BottomNav />
    </>
  );
}