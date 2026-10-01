// =========================================
// کامپوننت نمایش وضعیت کیفیت داده
// =========================================
import type { DataQualityStatus } from '@/types/intelligence';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<DataQualityStatus, { label: string; className: string; dot: string }> = {
  VALID: { label: 'معتبر', className: 'bg-green-500/10 border-green-500/20 text-green-400', dot: 'bg-green-400' },
  STALE: { label: 'قدیمی', className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
  INVALID: { label: 'نامعتبر', className: 'bg-red-500/10 border-red-500/20 text-red-400', dot: 'bg-red-400' },
  MISSING: { label: 'موجود نیست', className: 'bg-muted border-border text-muted-foreground', dot: 'bg-muted-foreground' },
  DUPLICATE: { label: 'تکراری', className: 'bg-orange-500/10 border-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
  INCOMPLETE: { label: 'ناقص', className: 'bg-orange-500/10 border-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
  CONFLICTED: { label: 'تضاد', className: 'bg-purple-500/10 border-purple-500/20 text-purple-400', dot: 'bg-purple-400' },
  UNAVAILABLE: { label: 'در دسترس نیست', className: 'bg-muted border-border text-muted-foreground', dot: 'bg-muted-foreground' },
  UNVERIFIED: { label: 'تأیید نشده', className: 'bg-blue-500/10 border-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
  NOT_SUPPORTED: { label: 'پشتیبانی نمی‌شود', className: 'bg-muted border-border text-muted-foreground', dot: 'bg-muted-foreground' },
  NOT_CONNECTED: { label: 'متصل نیست', className: 'bg-red-500/10 border-red-500/20 text-red-400', dot: 'bg-red-400' },
  INSUFFICIENT_DATA: { label: 'داده ناکافی', className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
};

interface DataQualityBadgeProps {
  status: DataQualityStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export function DataQualityBadge({ status, showDot = true, size = 'sm' }: DataQualityBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['UNAVAILABLE'];
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config.className
    )}>
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />}
      {config.label}
    </span>
  );
}

// کامپوننت وضعیت Provider
export type ProviderStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';

const PROVIDER_CONFIG: Record<ProviderStatus, { label: string; className: string }> = {
  HEALTHY: { label: 'سالم', className: 'bg-green-500/10 border-green-500/20 text-green-400' },
  DEGRADED: { label: 'تخریب‌شده', className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
  UNHEALTHY: { label: 'ناسالم', className: 'bg-red-500/10 border-red-500/20 text-red-400' },
  UNKNOWN: { label: 'نامشخص', className: 'bg-muted border-border text-muted-foreground' },
};

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const config = PROVIDER_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium', config.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.className.includes('green') ? 'bg-green-400' : config.className.includes('yellow') ? 'bg-yellow-400' : 'bg-red-400')} />
      {config.label}
    </span>
  );
}

// کامپوننت نمایش Source
export function SourceBadge({ source }: { source: 'live' | 'cache' | 'unavailable' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium',
      source === 'live' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
      source === 'cache' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
      'bg-muted border-border text-muted-foreground'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full',
        source === 'live' ? 'bg-green-400 animate-pulse' :
        source === 'cache' ? 'bg-yellow-400' : 'bg-muted-foreground'
      )} />
      {source === 'live' ? 'داده زنده' : source === 'cache' ? 'داده کش شده' : 'در دسترس نیست'}
    </span>
  );
}

// کامپوننت نمایش جهت Forecast
export function ForecastDirectionBadge({ direction }: { direction: 'UP' | 'DOWN' | 'NEUTRAL' | 'UNKNOWN' }) {
  const config = {
    UP: { label: '▲ صعودی', className: 'bg-green-500/10 border-green-500/20 text-green-400' },
    DOWN: { label: '▼ نزولی', className: 'bg-red-500/10 border-red-500/20 text-red-400' },
    NEUTRAL: { label: '◆ خنثی', className: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    UNKNOWN: { label: '? نامشخص', className: 'bg-muted border-border text-muted-foreground' },
  }[direction];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-sm font-semibold', config.className)}>
      {config.label}
    </span>
  );
}

// کامپوننت نمایش Signal
export function SignalDirectionBadge({ direction }: { direction: 'BUY' | 'SELL' | 'NO_ENTRY' }) {
  const config = {
    BUY: { label: 'خرید', className: 'bg-green-500/20 border-green-500/30 text-green-300 font-bold' },
    SELL: { label: 'فروش', className: 'bg-red-500/20 border-red-500/30 text-red-300 font-bold' },
    NO_ENTRY: { label: 'عدم ورود', className: 'bg-muted border-border text-muted-foreground' },
  }[direction];
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full border text-sm', config.className)}>
      {config.label}
    </span>
  );
}

// کامپوننت نمایش Market Regime
export function MarketRegimeBadge({ regime }: { regime: string }) {
  const regimeMap: Record<string, { label: string; className: string }> = {
    TRENDING_UP: { label: 'روند صعودی', className: 'bg-green-500/10 border-green-500/20 text-green-400' },
    TRENDING_DOWN: { label: 'روند نزولی', className: 'bg-red-500/10 border-red-500/20 text-red-400' },
    RANGING: { label: 'رنج', className: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    HIGH_VOLATILITY: { label: 'نوسان بالا', className: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
    LOW_VOLATILITY: { label: 'نوسان پایین', className: 'bg-muted border-border text-muted-foreground' },
    BREAKOUT: { label: 'شکست', className: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
    BREAKDOWN: { label: 'ریزش', className: 'bg-red-500/10 border-red-500/20 text-red-400' },
    TRANSITION: { label: 'انتقال', className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
    UNKNOWN: { label: 'نامشخص', className: 'bg-muted border-border text-muted-foreground' },
  };
  const config = regimeMap[regime] ?? { label: regime, className: 'bg-muted border-border text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}

// کامپوننت وضعیت اتصال (نسخه جدید)
export type ConnectionStatus = 'متصل' | 'قطع شده' | 'محدود شده' | 'در حال بررسی' | 'خطا' | 'پیکربندی نشده';
export type RiskLevel = 'مناسب' | 'متوسط' | 'ضعیف' | 'مشکوک';
export type NetworkType = 'BSC' | 'ETH' | 'BASE';

export function NetworkBadge({ network }: { network: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    BSC: { color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    ETH: { color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/30' },
    BASE: { color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-600/30' },
  };
  const c = config[network] ?? { color: 'text-muted-foreground', bg: 'bg-muted border-border' };
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-bold border', c.bg, c.color)}>
      {network}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const config: Record<RiskLevel, string> = {
    'مناسب': 'bg-green-500/10 border-green-500/20 text-green-400',
    'متوسط': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    'ضعیف': 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    'مشکوک': 'bg-red-500/10 border-red-500/20 text-red-400',
  };
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs border', config[risk])}>
      {risk}
    </span>
  );
}

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config: Record<ConnectionStatus, string> = {
    'متصل': 'bg-green-500/10 border-green-500/20 text-green-400',
    'قطع شده': 'bg-red-500/10 border-red-500/20 text-red-400',
    'محدود شده': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    'در حال بررسی': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    'خطا': 'bg-red-500/10 border-red-500/20 text-red-400',
    'پیکربندی نشده': 'bg-muted border-border text-muted-foreground',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium', config[status])}>
      <span className={cn('w-1.5 h-1.5 rounded-full',
        status === 'متصل' ? 'bg-green-400 animate-pulse' :
        status === 'در حال بررسی' ? 'bg-blue-400 animate-pulse' :
        status === 'محدود شده' ? 'bg-yellow-400' :
        status === 'پیکربندی نشده' ? 'bg-muted-foreground' : 'bg-red-400'
      )} />
      {status}
    </span>
  );
}
