import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  Wallet,
  TrendingUp,
  BarChart2,
  Settings,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  Newspaper,
  Link2,
  Brain,
  X,
  Server,
  Target,
  Bot,
  Radio,
  LineChart,
  ListChecks,
  ShieldCheck,
  WalletCards,
  Settings2,
  History,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'داشبورد',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'داشبورد اصلی' },
    ],
  },
  {
    title: 'ربات تریدر',
    items: [
      { path: '/trader-bot', icon: Bot, label: 'مرکز ربات' },
      { path: '/trader-bot/live', icon: Radio, label: 'مانیتور زنده' },
      { path: '/trader-bot/strategies', icon: LineChart, label: 'استراتژی‌ها' },
      { path: '/trader-bot/orders', icon: ListChecks, label: 'سفارش‌ها' },
      { path: '/trader-bot/positions', icon: WalletCards, label: 'موقعیت‌ها' },
      { path: '/trader-bot/risk', icon: ShieldCheck, label: 'مدیریت ریسک' },
      { path: '/trader-bot/exchanges', icon: Radio, label: 'اتصال صرافی' },
      { path: '/trader-bot/logs', icon: History, label: 'لاگ و رویدادها' },
      { path: '/trader-bot/settings', icon: Settings2, label: 'تنظیمات ربات' },
    ],
  },
  {
    title: 'تحلیل بازار',
    items: [
      { path: '/technical', icon: TrendingUp, label: 'تحلیل تکنیکال' },
      { path: '/market-intel', icon: Globe, label: 'هوش بازار' },
      { path: '/derivatives', icon: Zap, label: 'مشتقات' },
    ],
  },
  {
    title: 'هوش دیجیتال',
    items: [
      { path: '/onchain', icon: Link2, label: 'On-Chain' },
      { path: '/smart-money', icon: Wallet, label: 'کیف پول هوشمند' },
      { path: '/news', icon: Newspaper, label: 'اخبار' },
    ],
  },
  {
    title: 'موتور سیگنال',
    items: [
      { path: '/scanner', icon: Scan, label: 'اسکنر توکن' },
      { path: '/signals', icon: Brain, label: 'سیگنال‌ها' },
      { path: '/forecast', icon: Target, label: 'عملکرد Forecast' },
    ],
  },
  {
    title: 'سیستم',
    items: [
      { path: '/market', icon: BarChart2, label: 'بازار' },
      { path: '/alerts', icon: Bell, label: 'اعلان‌ها' },
      { path: '/providers', icon: Server, label: 'Provider‌ها' },
      { path: '/health', icon: Activity, label: 'سلامت سیستم' },
    ],
  },
  {
    title: 'ابزار',
    items: [
      { path: '/settings', icon: Settings, label: 'تنظیمات' },
    ],
  },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, unreadCount } = useAppStore();
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'relative flex h-screen shrink-0 flex-col',
        'bg-sidebar border-l border-sidebar-border',
        'transition-[width] duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border p-3">
        {sidebarOpen ? (
          <>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
                <Brain className="h-4 w-4 text-white" />
              </div>

              <div className="min-w-0 overflow-hidden">
                <p className="whitespace-nowrap text-sm font-bold leading-tight text-foreground">
                  Crypto Intelligence
                </p>
                <p className="whitespace-nowrap text-xs text-muted-foreground">
                  Enterprise v1.0
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              aria-label="بستن منو"
              title="بستن منو"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Brain className="h-4 w-4 text-white" />
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              aria-label="باز کردن منو"
              title="باز کردن منو"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {sidebarOpen ? (
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {group.title}
              </p>
            ) : (
              group !== NAV_GROUPS[0] && (
                <div className="mx-2 my-2 h-px bg-sidebar-border" />
              )
            )}

            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const hasAlert = item.path === '/alerts' && unreadCount > 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'nav-item w-full',
                    isActive ? 'nav-item-active' : 'nav-item-inactive',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="relative shrink-0">
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive && 'text-primary'
                      )}
                    />

                    {hasAlert && (
                      <span className="absolute -left-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {sidebarOpen && (
                    <>
                      <span className="flex-1 truncate text-right text-sm">
                        {item.label}
                      </span>

                      {hasAlert && (
                        <span className="min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="shrink-0 border-t border-sidebar-border p-3">
          {user?.email && (
            <p className="truncate px-1 text-center text-[10px] text-muted-foreground/70" title={user.email}>
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            خروج از حساب
          </button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
            Crypto Intelligence Enterprise v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
