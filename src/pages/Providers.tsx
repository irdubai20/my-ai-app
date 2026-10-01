// =========================================
// صفحه Provider Management
// مدیریت منابع داده و وضعیت آن‌ها
// =========================================
import { useState, useCallback } from 'react';
import { Server, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge, ProviderStatusBadge } from '@/components/features/StatusBadge';
import { checkRpcHealth } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProviderItem {
  id: string;
  name: string;
  type: string;
  priority: number;
  url: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  latency?: number;
  lastError?: string;
  successCount: number;
  failureCount: number;
  lastCheckedAt?: Date;
  blockNumber?: string;
  note?: string;
  needsBackend?: boolean;
}

const INITIAL_PROVIDERS: ProviderItem[] = [
  // Market Data
  { id: 'cg1', name: 'CoinGecko', type: 'Market Data', priority: 100, url: 'https://api.coingecko.com/api/v3', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'داده بازار، قیمت، Market Cap — رایگان بدون API Key' },
  { id: 'bn1', name: 'Binance REST', type: 'Market Data', priority: 90, url: 'https://api.binance.com/api/v3', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'Ticker، Klines، Order Book — Public' },
  { id: 'bnf1', name: 'Binance Futures', type: 'Derivatives', priority: 80, url: 'https://fapi.binance.com/fapi/v1', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'Funding Rate، Open Interest، Long/Short — Public' },
  // RPC
  { id: 'bsc1', name: 'BSC Public RPC', type: 'Blockchain RPC', priority: 70, url: 'https://bsc-dataseed.binance.org/', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'BNB Chain ETH-compatible RPC' },
  { id: 'eth1', name: 'Cloudflare ETH', type: 'Blockchain RPC', priority: 70, url: 'https://cloudflare-eth.com', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'Ethereum Public RPC' },
  { id: 'base1', name: 'Base Mainnet', type: 'Blockchain RPC', priority: 70, url: 'https://mainnet.base.org', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'Base Network Public RPC' },
  // News
  { id: 'ct1', name: 'CoinTelegraph RSS', type: 'News', priority: 60, url: 'https://cointelegraph.com/rss', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'اخبار کریپتو از RSS2JSON' },
  // Backend-dependent
  { id: 'bybit1', name: 'Bybit', type: 'Market Data', priority: 50, url: 'https://api.bybit.com', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'نیاز به Backend CORS Proxy', needsBackend: true },
  { id: 'okx1', name: 'OKX', type: 'Market Data', priority: 40, url: 'https://www.okx.com', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'نیاز به Backend CORS Proxy', needsBackend: true },
  { id: 'dfl1', name: 'DeFiLlama', type: 'OnChain', priority: 30, url: 'https://api.llama.fi', status: 'UNKNOWN', successCount: 0, failureCount: 0, note: 'TVL، پروتکل‌ها — نیاز به پروکسی', needsBackend: true },
];

export default function Providers() {
  const [providers, setProviders] = useState<ProviderItem[]>(INITIAL_PROVIDERS);
  const [checking, setChecking] = useState(false);

  const checkAll = useCallback(async () => {
    setChecking(true);
    setProviders(prev => prev.map(p => ({ ...p, status: 'UNKNOWN' as const })));

    const updated = [...providers];

    // بررسی RPC providers
    const rpcProviders = updated.filter(p => p.type === 'Blockchain RPC');
    for (const p of rpcProviders) {
      const res = await checkRpcHealth(p.url);
      const idx = updated.findIndex(x => x.id === p.id);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          status: res.ok ? 'HEALTHY' : 'UNHEALTHY',
          latency: res.latency,
          blockNumber: res.blockNumber,
          lastCheckedAt: new Date(),
          successCount: res.ok ? updated[idx].successCount + 1 : updated[idx].successCount,
          failureCount: !res.ok ? updated[idx].failureCount + 1 : updated[idx].failureCount,
          lastError: res.ok ? undefined : `تأخیر: ${res.latency}ms — پاسخ دریافت نشد`,
        };
      }
    }

    // بررسی CoinGecko
    try {
      const start = Date.now();
      const r = await fetch('https://api.coingecko.com/api/v3/ping', { signal: AbortSignal.timeout(5000) });
      const latency = Date.now() - start;
      const idx = updated.findIndex(x => x.id === 'cg1');
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], status: r.ok ? 'HEALTHY' : 'DEGRADED', latency, lastCheckedAt: new Date(), successCount: updated[idx].successCount + (r.ok ? 1 : 0), failureCount: updated[idx].failureCount + (!r.ok ? 1 : 0) };
      }
    } catch {
      const idx = updated.findIndex(x => x.id === 'cg1');
      if (idx !== -1) updated[idx] = { ...updated[idx], status: 'UNHEALTHY', lastError: 'timeout', lastCheckedAt: new Date() };
    }

    // بررسی Binance
    try {
      const start = Date.now();
      const r = await fetch('https://api.binance.com/api/v3/ping', { signal: AbortSignal.timeout(5000) });
      const latency = Date.now() - start;
      const idx = updated.findIndex(x => x.id === 'bn1');
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], status: r.ok ? 'HEALTHY' : 'DEGRADED', latency, lastCheckedAt: new Date(), successCount: updated[idx].successCount + (r.ok ? 1 : 0) };
      }
    } catch {
      const idx = updated.findIndex(x => x.id === 'bn1');
      if (idx !== -1) updated[idx] = { ...updated[idx], status: 'UNHEALTHY', lastCheckedAt: new Date() };
    }

    // سایر providerها — Backend لازم دارند
    for (const p of updated) {
      if (p.needsBackend && p.status === 'UNKNOWN') {
        const idx = updated.findIndex(x => x.id === p.id);
        updated[idx] = { ...updated[idx], status: 'UNHEALTHY', lastError: 'Backend پیکربندی نشده', lastCheckedAt: new Date() };
      }
    }

    setProviders([...updated]);
    setChecking(false);
  }, [providers]);

  const typeGroups = [...new Set(providers.map(p => p.type))];
  const healthyCount = providers.filter(p => p.status === 'HEALTHY').length;
  const unhealthyCount = providers.filter(p => p.status === 'UNHEALTHY').length;

  return (
    <div className="min-h-full">
      <Header
        title="مدیریت Provider"
        subtitle="منابع داده و وضعیت اتصال"
        onRefresh={checkAll}
        isRefreshing={checking}
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* خلاصه */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{healthyCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Provider سالم</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{unhealthyCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Provider ناسالم</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{providers.filter(p => p.status === 'UNKNOWN').length}</p>
            <p className="text-xs text-muted-foreground mt-1">بررسی نشده</p>
          </div>
        </div>

        {/* لیست Provider */}
        {typeGroups.map(type => (
          <div key={type} className="glass-card">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                {type}
              </h3>
            </div>
            <div className="divide-y divide-border/20">
              {providers.filter(p => p.type === type).map(p => (
                <div key={p.id} className="flex items-start gap-4 p-4 hover:bg-secondary/20">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    p.status === 'HEALTHY' ? 'bg-green-500/10' :
                    p.status === 'UNHEALTHY' ? 'bg-red-500/10' :
                    'bg-muted'
                  )}>
                    {p.status === 'HEALTHY' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                     p.status === 'UNHEALTHY' ? <XCircle className="w-5 h-5 text-red-400" /> :
                     <AlertTriangle className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <ProviderStatusBadge status={p.status} />
                      <span className="text-xs text-muted-foreground">اولویت: {p.priority}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{p.url}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{p.note}</p>
                    {p.needsBackend && (
                      <DataQualityBadge status="NOT_CONNECTED" />
                    )}
                    {p.lastError && (
                      <p className="text-xs text-red-400 mt-1">{p.lastError}</p>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0 space-y-1">
                    {p.latency !== undefined && (
                      <p className="text-xs text-muted-foreground number-display">{p.latency}ms</p>
                    )}
                    {p.blockNumber && (
                      <p className="text-xs text-muted-foreground">#{parseInt(p.blockNumber).toLocaleString('en')}</p>
                    )}
                    {p.lastCheckedAt && (
                      <p className="text-xs text-muted-foreground">{p.lastCheckedAt.toLocaleTimeString('fa-IR')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Failover Policy */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            سیاست Failover
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>۱. Provider با اولویت بالاتر و وضعیت HEALTHY ابتدا انتخاب می‌شود.</p>
            <p>۲. در صورت Timeout یا خطا، Provider جایگزین فعال می‌شود.</p>
            <p>۳. اگر هیچ Provider سالم نبود: DATA_UNAVAILABLE نمایش داده می‌شود.</p>
            <p>۴. هرگز داده ساختگی جایگزین داده واقعی نمی‌شود.</p>
            <p>۵. Retry با Exponential Backoff (5s، 10s، 20s) انجام می‌شود.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
