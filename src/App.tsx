import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Scanner from '@/pages/Scanner';
import SmartMoney from '@/pages/SmartMoney';
import Signals from '@/pages/Signals';
import Market from '@/pages/Market';
import Alerts from '@/pages/Alerts';
import Health from '@/pages/Health';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
// صفحات جدید سازمانی
import TechnicalAnalysis from '@/pages/TechnicalAnalysis';
import Derivatives from '@/pages/Derivatives';
import MarketIntelligence from '@/pages/MarketIntelligence';
import OnChain from '@/pages/OnChain';
import ForecastPerformance from '@/pages/ForecastPerformance';
import Providers from '@/pages/Providers';
import News from '@/pages/News';
import TraderBot from '@/pages/TraderBot';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              {/* داشبورد */}
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />

              {/* ربات تریدر */}
              <Route path="/trader-bot" element={<AppLayout><TraderBot section="overview" /></AppLayout>} />
              <Route path="/trader-bot/live" element={<AppLayout><TraderBot section="live" /></AppLayout>} />
              <Route path="/trader-bot/strategies" element={<AppLayout><TraderBot section="strategies" /></AppLayout>} />
              <Route path="/trader-bot/orders" element={<AppLayout><TraderBot section="orders" /></AppLayout>} />
              <Route path="/trader-bot/positions" element={<AppLayout><TraderBot section="positions" /></AppLayout>} />
              <Route path="/trader-bot/risk" element={<AppLayout><TraderBot section="risk" /></AppLayout>} />
              <Route path="/trader-bot/exchanges" element={<AppLayout><TraderBot section="exchanges" /></AppLayout>} />
              <Route path="/trader-bot/logs" element={<AppLayout><TraderBot section="logs" /></AppLayout>} />
              <Route path="/trader-bot/settings" element={<AppLayout><TraderBot section="settings" /></AppLayout>} />

              {/* تحلیل بازار */}
              <Route path="/technical" element={<AppLayout><TechnicalAnalysis /></AppLayout>} />
              <Route path="/market-intel" element={<AppLayout><MarketIntelligence /></AppLayout>} />
              <Route path="/derivatives" element={<AppLayout><Derivatives /></AppLayout>} />

              {/* هوش دیجیتال */}
              <Route path="/onchain" element={<AppLayout><OnChain /></AppLayout>} />
              <Route path="/smart-money" element={<AppLayout><SmartMoney /></AppLayout>} />
              <Route path="/news" element={<AppLayout><News /></AppLayout>} />

              {/* موتور سیگنال */}
              <Route path="/scanner" element={<AppLayout><Scanner /></AppLayout>} />
              <Route path="/signals" element={<AppLayout><Signals /></AppLayout>} />
              <Route path="/forecast" element={<AppLayout><ForecastPerformance /></AppLayout>} />

              {/* سیستم */}
              <Route path="/market" element={<AppLayout><Market /></AppLayout>} />
              <Route path="/alerts" element={<AppLayout><Alerts /></AppLayout>} />
              <Route path="/providers" element={<AppLayout><Providers /></AppLayout>} />
              <Route path="/health" element={<AppLayout><Health /></AppLayout>} />

              {/* ابزار */}
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
