// =========================================
// صفحه سلامت سیستم — Enterprise Health Monitor
// =========================================
import { useState, useCallback } from 'react';
import { Activity, RefreshCw, CheckCircle, XCircle, AlertCircle, Info, Server, Database, Radio, Cpu, MessageSquare, HardDrive } from 'lucide-react';
import Header from '@/components/layout/Header';
import { ConnectionStatusBadge, DataQualityBadge } from '@/components/features/StatusBadge';
import { useAppStore } from '@/stores/appStore';
import { checkRpcHealth, fetchTopCoins } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/types';

interface HealthItem {
  id: string;
  label: string;
  status: ConnectionStatus;
  latency?: number;
  message?: string;
  icon: React.ElementType;
  lastChecked?: Date;
  required: boolean;
}

export default function Health() {
  const { settings } = useAppStore();
  const [items, setItems] = useState<HealthItem[]>([
    { id: 'api_cg', label: 'CoinGecko API', status: 'در حال بررسی', icon: Server, required: true },
    { id: 'api_bn', label: 'Binance API', status: 'در حال بررسی', icon: Server, required: true },
    { id: 'rpc_bsc', label: 'BSC RPC', status: 'در حال بررسی', icon: Radio, required: false },
    { id: 'rpc_eth', label: 'Ethereum RPC', status: 'در حال بررسی', icon: Radio, required: false },
    { id: 'rpc_base', label: 'Base RPC', status: 'در حال بررسی', icon: Radio, required: false },
    { id: 'db', label: 'Database (Backend)', status: 'پیکربندی نشده', message: 'نیاز به OnSpace Cloud', icon: Database, required: false },
    { id: 'redis', label: 'Redis Cache', status: 'پیکربندی نشده', message: 'نیاز به Backend', icon: Cpu, required: false },
    { id: 'queue', label: 'BullMQ Queue', status: 'پیکربندی نشده', message: 'نیاز به Backend', icon: Cpu, required: false },
    { id: 'telegram', label: 'Telegram Bot', status: settings.telegram.enabled ? 'در حال بررسی' : 'پیکربندی نشده', message: settings.telegram.enabled ? undefined : 'Bot Token تنظیم نشده', icon: MessageSquare, required: false },
    { id: 'storage', label: 'Local Storage', status: 'متصل', message: 'localStorage فعال', icon: HardDrive, required: true },
  ]);

  const [checking, setChecking] = useState(false);

  const checkAll = useCallback(async () => {
    setChecking(true);
    setItems(prev => prev.map(item => ({
      ...item,
      status: ['پیکربندی نشده'].includes(item.status) ? item.status : 'در حال بررسی' as ConnectionStatus,
    })));

    const updates: Record<string, Partial<HealthItem>> = {};

    // CoinGecko
    try {
      const start = Date.now();
      const res = await fetchTopCoins(5);
      const latency = Date.now() - start;
      updates['api_cg'] = {
        status: res.source !== 'unavailable' ? 'متصل' : 'قطع شده',
        latency,
        lastChecked: new Date(),
        message: res.source === 'live' ? 'داده زنده' : res.source === 'cache' ? 'از کش' : 'قطع',
      };
    } catch {
      updates['api_cg'] = { status: 'خطا', lastChecked: new Date() };
    }

    // Binance
    try {
      const start = Date.now();
      const r = await fetch('https://api.binance.com/api/v3/ping', { signal: AbortSignal.timeout(5000) });
      updates['api_bn'] = { status: r.ok ? 'متصل' : 'قطع شده', latency: Date.now() - start, lastChecked: new Date() };
    } catch {
      updates['api_bn'] = { status: 'قطع شده', lastChecked: new Date() };
    }

    // RPCها
    const rpcMap = [
      { id: 'rpc_bsc', url: settings.rpc.bsc || 'https://bsc-dataseed.binance.org/' },
      { id: 'rpc_eth', url: settings.rpc.eth || 'https://cloudflare-eth.com' },
      { id: 'rpc_base', url: settings.rpc.base || 'https://mainnet.base.org' },
    ];

    await Promise.all(rpcMap.map(async ({ id, url }) => {
      const res = await checkRpcHealth(url);
      updates[id] = {
        status: res.ok ? 'متصل' : 'قطع شده',
        latency: res.latency,
        lastChecked: new Date(),
        message: res.blockNumber ? `Block: #${parseInt(res.blockNumber).toLocaleString('en')}` : undefined,
      };
    }));

    // Telegram
    if (settings.telegram.enabled && settings.telegram.botToken) {
      try {
        const r = await fetch(`https://api.telegram.org/bot${settings.telegram.botToken}/getMe`, { signal: AbortSignal.timeout(5000) });
        const data = await r.json();
        updates['telegram'] = {
          status: data.ok ? 'متصل' : 'خطا',
          message: data.ok ? `@${data.result?.username}` : 'Token نامعتبر',
          lastChecked: new Date(),
        };
      } catch {
        updates['telegram'] = { status: 'خطا', message: 'Timeout', lastChecked: new Date() };
      }
    }

    setItems(prev => prev.map(item => ({
      ...item,
      ...updates[item.id],
    })));
    setChecking(false);
  }, [settings]);

  const connectedCount = items.filter(i => i.status === 'متصل').length;
  const errorCount = items.filter(i => ['خطا', 'قطع شده'].includes(i.status)).length;

  const overallStatus = errorCount > 0 && items.filter(i => i.required && ['خطا', 'قطع شده'].includes(i.status)).length > 0
    ? 'DEGRADED'
    : connectedCount > 0 ? 'HEALTHY' : 'UNHEALTHY';

  return (
    <div className="min-h-full">
      <Header
        title="سلامت سیستم"
        subtitle="بررسی وضعیت اتصال تمام سرویس‌ها"
        onRefresh={checkAll}
        isRefreshing={checking}
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* وضعیت کلی */}
        <div className={cn(
          'p-5 rounded-2xl border',
          overallStatus === 'HEALTHY' ? 'bg-green-500/5 border-green-500/20' :
          overallStatus === 'DEGRADED' ? 'bg-yellow-500/5 border-yellow-500/20' :
          'bg-red-500/5 border-red-500/20'
        )}>
          <div className="flex items-center gap-3">
            {overallStatus === 'HEALTHY' ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            ) : overallStatus === 'DEGRADED' ? (
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            )}
            <div>
              <p className={cn('font-semibold',
                overallStatus === 'HEALTHY' ? 'text-green-400' :
                overallStatus === 'DEGRADED' ? 'text-yellow-400' : 'text-red-400'
              )}>
                {overallStatus === 'HEALTHY' ? 'سیستم سالم' :
                 overallStatus === 'DEGRADED' ? 'سیستم در حال تخریب' : 'سیستم ناسالم'}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {connectedCount} متصل · {errorCount} خطا · {items.filter(i => i.status === 'پیکربندی نشده').length} پیکربندی نشده
              </p>
            </div>
          </div>
        </div>

        {/* لیست سرویس‌ها */}
        <div className="glass-card divide-y divide-border/20">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-secondary/20">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  item.status === 'متصل' ? 'bg-green-500/10' :
                  item.status === 'پیکربندی نشده' ? 'bg-muted' :
                  ['خطا', 'قطع شده'].includes(item.status) ? 'bg-red-500/10' : 'bg-blue-500/10'
                )}>
                  <Icon className={cn('w-5 h-5',
                    item.status === 'متصل' ? 'text-green-400' :
                    item.status === 'پیکربندی نشده' ? 'text-muted-foreground' :
                    ['خطا', 'قطع شده'].includes(item.status) ? 'text-red-400' : 'text-blue-400'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{item.label}</p>
                    {item.required && <span className="text-xs badge-info">اجباری</span>}
                  </div>
                  {item.message && <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>}
                  {item.lastChecked && <p className="text-xs text-muted-foreground/60">{item.lastChecked.toLocaleTimeString('fa-IR')}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.latency !== undefined && (
                    <span className="text-xs text-muted-foreground number-display">{item.latency}ms</span>
                  )}
                  <ConnectionStatusBadge status={item.status} />
                </div>
              </div>
            );
          })}
        </div>

        {/* توضیح */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong className="text-foreground">پیکربندی نشده:</strong> سرویس Backend نیاز دارد یا Token تنظیم نشده.</p>
            <p><strong className="text-foreground">متصل:</strong> سرویس پاسخ داد و داده معتبر برگشت.</p>
            <p><strong className="text-foreground">قطع شده:</strong> سرویس پاسخ نمی‌دهد — ممکن است Rate Limit فعال باشد.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
