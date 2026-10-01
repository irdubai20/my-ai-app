import Sidebar from '@/components/layout/Sidebar';
import { useMarketData } from '@/hooks/useMarketData';
import { useSystemHealth } from '@/hooks/useSystemHealth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  useMarketData(true, 90_000);
  useSystemHealth();

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="min-h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
