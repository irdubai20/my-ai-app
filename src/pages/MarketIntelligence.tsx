// =========================================
// صفحه هوش بازار (Market Intelligence)
// داده واقعی: Global Market + Dominance + Breadth
// =========================================
import { useState, useEffect, useCallback } from 'react';
import { BarChart2, Globe, TrendingUp, TrendingDown, RefreshCw, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge, SourceBadge, MarketRegimeBadge } from '@/components/features/StatusBadge';
import { fetchGlobalMarket, fetchTopCoins } from '@/lib/api';
import { formatNumber, formatPercent, cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

interface GlobalData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCryptocurrencies: number;
  markets: number;
}

export default function MarketIntelligence() {
  const { marketData, setMarketData } = useAppStore();
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [globalSource, setGlobalSource] = useState<'live' | 'cache' | 'unavailable'>('unavailable');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [globalRes, marketRes] = await Promise.all([
      fetchGlobalMarket(),
      fetchTopCoins(50),
    ]);
    if (globalRes.data) {
      setGlobal({
        totalMarketCap: globalRes.data.total_market_cap?.usd ?? 0,
        totalVolume: globalRes.data.total_volume?.usd ?? 0,
        btcDominance: globalRes.data.market_cap_percentage?.btc ?? 0,
        ethDominance: globalRes.data.market_cap_percentage?.eth ?? 0,
        marketCapChange24h: globalRes.data.market_cap_change_percentage_24h_usd ?? 0,
        activeCryptocurrencies: globalRes.data.active_cryptocurrencies ?? 0,
        markets: globalRes.data.markets ?? 0,
      });
      setGlobalSource(globalRes.source);
    }
    setMarketData(marketRes.data, marketRes.source);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // محاسبه Breadth
  const advancers = marketData.filter(c => c.change24h > 0).length;
  const decliners = marketData.filter(c => c.change24h < 0).length;
  const unchanged = marketData.filter(c => c.change24h === 0).length;
  const breadthTotal = advancers + decliners + unchanged;
  const advancerPct = breadthTotal > 0 ? (advancers / breadthTotal) * 100 : 0;

  // تشخیص Regime از Breadth + BTC Dominance
  const getBreadthState = () => {
    if (marketData.length === 0) return { label: 'داده ناکافی', color: 'text-muted-foreground' };
    if (advancerPct > 70) return { label: 'عریض قوی — اکثر ارزها صعودی', color: 'text-green-400' };
    if (advancerPct > 55) return { label: 'عریض مثبت', color: 'text-green-400/70' };
    if (advancerPct > 45) return { label: 'خنثی', color: 'text-muted-foreground' };
    if (advancerPct > 30) return { label: 'عریض منفی', color: 'text-orange-400' };
    return { label: 'عریض ضعیف — اکثر ارزها نزولی', color: 'text-red-400' };
  };

  const breadthState = getBreadthState();

  // Top Gainers and Losers
  const sorted = [...marketData].sort((a, b) => b.change24h - a.change24h);
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  return (
    <div className="min-h-full">
      <Header
        title="هوش بازار"
        subtitle="نمای کلی بازار — CoinGecko Public API"
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* وضعیت منبع */}
        <div className="flex items-center gap-3 flex-wrap">
          <SourceBadge source={globalSource} />
          {lastUpdate && <span className="text-xs text-muted-foreground">آپدیت: {lastUpdate.toLocaleTimeString('fa-IR')}</span>}
          <DataQualityBadge status={global ? 'VALID' : 'UNAVAILABLE'} />
        </div>

        {loading && !global ? (
          <div className="glass-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">دریافت داده جهانی بازار...</p>
          </div>
        ) : (
          <>
            {/* شاخص‌های کلان */}
            {global ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlobalCard title="کل بازار" value={'$' + formatNumber(global.totalMarketCap)} subtitle={global.marketCapChange24h >= 0 ? `▲ ${formatPercent(global.marketCapChange24h)}` : `▼ ${formatPercent(global.marketCapChange24h)}`} subtitleColor={global.marketCapChange24h >= 0 ? 'text-green-400' : 'text-red-400'} />
                <GlobalCard title="حجم ۲۴ ساعت" value={'$' + formatNumber(global.totalVolume)} subtitle="Volume Global" />
                <GlobalCard title="سلطه BTC" value={global.btcDominance.toFixed(2) + '%'} subtitle={`ETH: ${global.ethDominance.toFixed(2)}%`} />
                <GlobalCard title="ارزهای فعال" value={global.activeCryptocurrencies.toLocaleString('fa-IR')} subtitle={`${global.markets} صرافی`} />
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <DataQualityBadge status="UNAVAILABLE" size="md" />
                <p className="text-sm text-muted-foreground mt-2">داده جهانی بازار در دسترس نیست.</p>
              </div>
            )}

            {/* Breadth */}
            {marketData.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-accent" />عرض بازار (Market Breadth)</h3>
                  <DataQualityBadge status="VALID" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-4 rounded-full bg-green-500" style={{ width: `${advancerPct}%`, minWidth: 8 }} />
                      <div className="h-4 rounded-full bg-muted-foreground/30" style={{ width: `${(unchanged / breadthTotal) * 100}%`, minWidth: 4 }} />
                      <div className="h-4 rounded-full bg-red-500" style={{ width: `${(decliners / breadthTotal) * 100}%`, minWidth: 8 }} />
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-400">▲ صعودی: {advancers} ({advancerPct.toFixed(0)}%)</span>
                      <span className="text-muted-foreground">◆ خنثی: {unchanged}</span>
                      <span className="text-red-400">▼ نزولی: {decliners}</span>
                    </div>
                  </div>
                </div>
                <div className={cn('text-sm font-medium', breadthState.color)}>{breadthState.label}</div>
                {global && (
                  <p className="text-xs text-muted-foreground mt-2">
                    سلطه BTC: {global.btcDominance.toFixed(2)}% —
                    {global.btcDominance > 52 ? ' سرمایه در BTC متمرکز است.' :
                     global.btcDominance < 45 ? ' فصل Altcoin در جریان است.' : ' توزیع سرمایه متعادل است.'}
                  </p>
                )}
              </div>
            )}

            {/* Top Gainers + Losers */}
            {marketData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="glass-card">
                  <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <h3 className="font-semibold text-green-400">برترین صعودی‌ها (۲۴h)</h3>
                  </div>
                  <div className="divide-y divide-border/20">
                    {topGainers.map(coin => (
                      <div key={coin.symbol} className="flex items-center gap-3 p-3 hover:bg-secondary/20">
                        {coin.image && <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                        </div>
                        <p className="text-sm font-bold text-green-400 number-display">{formatPercent(coin.change24h)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card">
                  <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <h3 className="font-semibold text-red-400">برترین نزولی‌ها (۲۴h)</h3>
                  </div>
                  <div className="divide-y divide-border/20">
                    {topLosers.map(coin => (
                      <div key={coin.symbol} className="flex items-center gap-3 p-3 hover:bg-secondary/20">
                        {coin.image && <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground truncate">{coin.name}</p>
                        </div>
                        <p className="text-sm font-bold text-red-400 number-display">{formatPercent(coin.change24h)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ماژول‌های پیاده‌سازی نشده */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Correlation Matrix', desc: 'ماتریس همبستگی بین ارزها — نیاز به داده تاریخی و Backend', status: 'NOT_CONNECTED' as const },
                { title: 'Capital Flow Intelligence', desc: 'جریان سرمایه بین شبکه‌ها و صرافی‌ها — نیاز به OnChain Data', status: 'NOT_CONNECTED' as const },
                { title: 'Stablecoin Intelligence', desc: 'Supply و Depeg Risk — USDT, USDC, DAI', status: 'NOT_CONNECTED' as const },
                { title: 'DeFi Intelligence', desc: 'TVL، پروتکل‌ها، DEX Volume — DeFiLlama API', status: 'NOT_CONNECTED' as const },
              ].map(mod => (
                <div key={mod.title} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-muted-foreground">{mod.title}</h4>
                    <DataQualityBadge status={mod.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GlobalCard({ title, value, subtitle, subtitleColor }: {
  title: string; value: string; subtitle: string; subtitleColor?: string;
}) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-bold number-display text-foreground">{value}</p>
      <p className={cn('text-xs mt-0.5', subtitleColor ?? 'text-muted-foreground')}>{subtitle}</p>
    </div>
  );
}
