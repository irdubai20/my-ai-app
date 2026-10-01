import { Bell, CheckCheck, Trash2, Zap, AlertTriangle, Info, Activity, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import EmptyState from '@/components/features/EmptyState';
import { useAppStore } from '@/stores/appStore';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Alert } from '@/types';
import { toast } from 'sonner';
import { saveAlerts } from '@/lib/storage';

const ALERT_ICONS = {
  'سیگنال': Zap,
  'هشدار': AlertTriangle,
  'خطا': AlertCircle,
  'سلامت': Activity,
  'اطلاعات': Info,
};

const ALERT_COLORS = {
  'سیگنال': 'bg-primary/10 text-primary',
  'هشدار': 'bg-yellow-500/10 text-yellow-400',
  'خطا': 'bg-red-500/10 text-red-400',
  'سلامت': 'bg-cyan-500/10 text-cyan-400',
  'اطلاعات': 'bg-blue-500/10 text-blue-400',
};

export default function Alerts() {
  const { alerts, unreadCount, markAllRead, loadAlerts } = useAppStore();

  const handleMarkAllRead = () => {
    markAllRead();
    toast.success('همه اعلان‌ها خوانده شد');
  };

  const handleClearAll = () => {
    saveAlerts([]);
    loadAlerts();
    toast.info('همه اعلان‌ها پاک شدند');
  };

  const handleDeleteAlert = (id: string) => {
    const remaining = alerts.filter(a => a.id !== id);
    saveAlerts(remaining);
    loadAlerts();
  };

  return (
    <div className="min-h-full">
      <Header
        title="اعلان‌ها"
        subtitle={`${unreadCount} اعلان خوانده نشده`}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                همه خوانده
              </button>
            )}
            {alerts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                پاک کردن
              </button>
            )}
          </div>
        }
      />

      <div className="p-4 lg:p-6">
        {alerts.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              icon={Bell}
              title="هیچ اعلانی وجود ندارد"
              description="اعلان‌های سیگنال، هشدار و سلامت سیستم اینجا نمایش داده می‌شوند."
            />
          </div>
        ) : (
          <div className="glass-card divide-y divide-border/30">
            {alerts.map(alert => {
              const Icon = ALERT_ICONS[alert.type] ?? Info;
              const colorCls = ALERT_COLORS[alert.type] ?? 'bg-muted text-muted-foreground';
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-4 transition-colors',
                    !alert.read && 'bg-primary/5',
                    'hover:bg-secondary/20'
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colorCls)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{alert.title}</span>
                      {!alert.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full border', colorCls, 'border-current/20')}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeTime(alert.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
