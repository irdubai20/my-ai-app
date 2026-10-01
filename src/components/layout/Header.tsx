// ===================================
// هدر صفحات
// ===================================
import { Menu, RefreshCw, Bell, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onRefresh, isRefreshing, actions }: HeaderProps) {
  const { setSidebarOpen, unreadCount, lastMarketUpdate, marketDataSource } = useAppStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Market data status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary text-xs">
          {marketDataSource === 'live' ? (
            <>
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-green-400">زنده</span>
            </>
          ) : marketDataSource === 'cache' ? (
            <>
              <Wifi className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">کش</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">آفلاین</span>
            </>
          )}
          {lastMarketUpdate && (
            <span className="text-muted-foreground hidden md:block">
              · {formatRelativeTime(lastMarketUpdate)}
            </span>
          )}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            title="بروزرسانی"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="اعلان‌ها"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
