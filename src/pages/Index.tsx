import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Zap, Activity,
  BarChart2, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight,
  Brain, Shield, Target, Globe, Link2, Server, Newspaper
} from 'lucide-react';
import Header from '@/components/layout/Header';
import StatCard from '@/components/features/StatCard';
import { NetworkBadge, RiskBadge, DataQualityBadge, SourceBadge, MarketRegimeBadge } from '@/components/features/StatusBadge';
import { useAppStore } from '@/stores/appStore';
import { formatPrice, formatNumber, formatPercent, formatRelativeTime, getChangeColor, cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const SAMPLE_SIGNALS = [
  { id: '1', token: 'CAKE', network: 'BSC', type: 'خرید', confidence: 78, risk: 'مناسب' as const, price: 2.34, change: 12.4, wallets: 7, ago: '۱۵ دقیقه پیش', note: 'نمونه' },
  { id: '2', token: 'ARB', network: 'ETH', type: 'خرید', confidence: 65, risk: 'متوسط' as const, price: 0.891, change: 8.2, wallets: 4, ago: '۳۲ دقیقه پیش', note: 'نمونه' },
  { id: '3', token: 'BRETT', network: 'BASE', type: 'فروش', confidence: 71, risk: 'متوسط' as const, price: 0.0041, change: -5.3, wallets: 5, ago: '۱ ساعت پیش', note: 'نمونه' },
];

const MODULES = [
  { title: 'تحلیل تکنیکال', path: '/technical', icon: TrendingUp, color: 'text-primary', desc: 'RSI, MACD, EMA, ATR', status: 'VALID' as const },
  { title: 'مشتقات', path: '/derivatives', icon: Zap, color: 'text-yellow-400', desc: 'Funding, OI, Long/Short', status: 'VALID' as const },
  { title: 'هوش بازار', path: '/market-intel', icon: Globe, color: 'text-cyan-400', desc: 'BTC Dominance, Breadth', status: 'VALID' as const },
  { title: 'On-Chain', path: '/onchain', icon: Link2, color: 'text-green-400', desc: 'RPC، تراکنش‌ها', status: 'VALID' as const },
  { title: 'کیف پول هوشمند', path: '/smart-money', icon: Wallet, color: 'text-purple-400', desc: 'Smart Money Tracking', status: 'NOT_CONNECTED' as const },
  { title: 'Provider‌ها', path: '/providers', icon: Server, color: 'text-blue-400', desc: 'مدیریت منابع داده', status: 'VALID' as const },
];

export default function Index() {
  const { marketData, lastMarketUpdate, marketDataSource } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const { fetchTopCoins } = await import('@/lib/api');
    const result = await fetchTopCoins(30);
    useAppStore.getState().setMarketData(result.data, result.source);
    setIsRefreshing(false);
  };

  // بارگذاری خودکار
  useEffect(() => {
    if (marketData.length === 0) handleRefresh();
  }, []);

  const btc = marketData.find(c => c.symbol === 'BTC');
  const eth = marketData.find(c => c.symbol === 'ETH');
  const bnb = marketData.find(c => c.symbol === 'BNB');
  const sol = marketData.find(c => c.symbol === 'SOL');
  const totalMcap = marketData.reduce((s, c) => s + c.marketCap, 0);

  return (
    <div className="min-h-full">
      <Header
        title="داشبورد اصلی"
        subtitle="Crypto Intelligence Enterprise — هوش بازار ارزهای دیجیتال"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Hero Banner */}
        <div
          className="relative rounded-2xl overflow-hidden h-44 lg:h-52"
          style={{ background: 'linear-gradient(135deg, #0d0d1f 0%, #120b2e 30%, #0b1f3d 65%, #071428 100%)' }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,56,234,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(14,165,233,0.1) 0%, transparent 50%)'
          }} />
          <div className="absolute inset-0 flex items-center p-6 lg:p-10">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  Crypto Intelligence Enterprise
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">هوش بازار ارزهای دیجیتال</h2>
              <p className="text-muted-foreground text-sm max-w-md">تحلیل چندلایه، Forecast، Signal و مدیریت ریسک — مهندس موسی بعاجی</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <SourceBadge source={marketDataSource} />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>
                    {lastMarketUpdate ? `آپدیت: ${formatRelativeTime(lastMarketUpdate)}` : 'در انتظار داده...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* ستاره‌های دکوراتیو */}
          <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-primary/40 rounded-full" />
          <div className="absolute top-12 left-24 w-1 h-1 bg-cyan-400/30 rounded-full" />
          <div className="absolute bottom-8 left-16 w-2 h-2 bg-primary/20 rounded-full" />
        </div>

        {/* شاخص‌های کلیدی بازار */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />نمای کلی بازار
            </h3>
            {marketDataSource !== 'live' && (
              <DataQualityBadge status={marketDataSource === 'cache' ? 'STALE' : 'UNAVAILABLE'} />
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="بیت‌کوین" value={btc ? formatPrice(btc.price) : '—'} subtitle="BTC" icon={TrendingUp} iconColor="text-orange-400" trend={btc?.change24h} />
            <StatCard title="اتریوم" value={eth ? formatPrice(eth.price) : '—'} subtitle="ETH" icon={Zap} iconColor="text-blue-400" trend={eth?.change24h} />
            <StatCard title="بایننس کوین" value={bnb ? formatPrice(bnb.price) : '—'} subtitle="BNB" icon={Shield} iconColor="text-yellow-400" trend={bnb?.change24h} />
            <StatCard title="کل بازار" value={totalMcap > 0 ? '$' + formatNumber(totalMcap) : '—'} subtitle="Market Cap" icon={Target} iconColor="text-purple-400" />
          </div>
        </div>

        {/* ماژول‌های Intelligence */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />ماژول‌های Intelligence
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES.map(mod => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.path}
                  onClick={() => navigate(mod.path)}
                  className="glass-card p-4 text-right hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <DataQualityBadge status={mod.status} />
                    <Icon className={cn('w-5 h-5', mod.color)} />
                  </div>
                  <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* سیگنال‌های اخیر — نمونه */}
          <div className="glass-card">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />آخرین سیگنال‌ها
              </h3>
              <DataQualityBadge status="UNVERIFIED" />
            </div>
            <div className="divide-y divide-border/30">
              {SAMPLE_SIGNALS.map(sig => (
                <div key={sig.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    sig.type === 'خرید' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {sig.type === 'خرید' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{sig.token}</span>
                      <NetworkBadge network={sig.network} />
                      <RiskBadge risk={sig.risk} />
                      <span className="text-xs badge-warning">{sig.note}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatPrice(sig.price)} · {sig.wallets} کیف پول · {sig.confidence}% اطمینان
                    </p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className={cn('text-sm font-bold number-display', getChangeColor(sig.change))}>
                      {formatPercent(sig.change)}
                    </p>
                    <p className="text-xs text-muted-foreground">{sig.ago}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border/30">
              <button onClick={() => navigate('/signals')} className="text-xs text-primary hover:underline">
                مشاهده همه سیگنال‌ها ←
              </button>
            </div>
          </div>

          {/* بازار ارزها */}
          {marketData.length > 0 ? (
            <div className="glass-card">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-accent" />بازار ارزها
                </h3>
                <SourceBadge source={marketDataSource} />
              </div>
              <div className="divide-y divide-border/20">
                {marketData.slice(0, 8).map(coin => (
                  <div key={coin.symbol} className="flex items-center gap-3 p-3 hover:bg-secondary/20">
                    {coin.image && <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{coin.symbol}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{coin.name}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-mono number-display">{formatPrice(coin.price)}</p>
                      <p className={cn('text-xs number-display', getChangeColor(coin.change24h))}>{formatPercent(coin.change24h)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border/30">
                <button onClick={() => navigate('/market-intel')} className="text-xs text-primary hover:underline">
                  هوش بازار کامل ←
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">داده بازار در دسترس نیست.</p>
              <button onClick={handleRefresh} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                تلاش مجدد
              </button>
            </div>
          )}
        </div>

        {/* هشدار پایین صفحه */}
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ این سامانه پیش‌بینی قطعی ارائه نمی‌کند. تمام تحلیل‌ها مبتنی بر داده‌های موجود هستند.
            نتیجه واقعی بازار می‌تواند متفاوت باشد. مسئولیت تصمیم‌گیری با کاربر است.
          </p>
        </div>
      </div>
    </div>
  );
}
