import Navbar from '@/components/ui/Navbar';
import PageWrapper from '@/components/providers/PageWrapper';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PageWrapper>
        {children}
      </PageWrapper>
    </div>
  );
}