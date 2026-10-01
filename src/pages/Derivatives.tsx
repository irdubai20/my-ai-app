// =========================================
// صفحه Derivatives Intelligence
// Funding Rate + Open Interest + Long/Short
// داده واقعی Binance Futures Public API
// =========================================
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Info, DollarSign, BarChart2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge, SourceBadge } from '@/components/features/StatusBadge';
import { fetchFundingRate, fetchOpenInterest, fetchLongShortRatio, fetchBinanceTicker } from '@/lib/api';
import { formatPrice, formatNumber, formatPercent, cn } from '@/lib/utils';

const PERPETUALS = [
  { label: 'BTC', value: 'BTCUSDT' },
  { label: 'ETH', value: 'ETHUSDT' },
  { label: 'BNB', value: 'BNBUSDT' },
  { label: 'SOL', value: 'SOLUSDT' },
  { label: 'XRP', value: 'XRPUSDT' },
];

interface DerivData {
  symbol: string;
  price: number | null;
  priceChange: number | null;
  fundingRate: number | null;
  openInterest: number | null;
  longRatio: number | null;
  shortRatio: number | null;
  lsRatio: number | null;
  fundingSource: 'live' | 'cache' | 'unavailable';
  oiSource: 'live' | 'cache' | 'unavailable';
  lsSource: 'live' | 'cache' | 'unavailable';
  priceSource: 'live' | 'cache' | 'unavailable';
}

export default function Derivatives() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DerivData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      PERPETUALS.map(async (p) => {
        const [fundRes, oiRes, lsRes, tickerRes] = await Promise.all([
          fetchFundingRate(p.value),
          fetchOpenInterest(p.value),
          fetchLongShortRatio(p.value, '1h'),
          fetchBinanceTicker(p.value),
        ]);
        const ticker = tickerRes.data;
        return {
          symbol: p.value,
          price: ticker ? parseFloat(ticker.lastPrice) : null,
          priceChange: ticker ? parseFloat(ticker.priceChangePercent) : null,
          fundingRate: fundRes.rate,
          openInterest: oiRes.value,
          longRatio: lsRes.longPct,
          shortRatio: lsRes.shortPct,
          lsRatio: lsRes.ratio,
          fundingSource: fundRes.source,
          oiSource: oiRes.source,
          lsSource: lsRes.source,
          priceSource: tickerRes.source,
        } as DerivData;
      })
    );
    setData(results);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const fundingStatus = (rate: number | null) => {
    if (rate === null) return { label: 'در دسترس نیست', color: 'text-muted-foreground' };
    if (rate > 0.001) return { label: 'مثبت بالا (فشار فروش)', color: 'text-red-400' };
    if (rate < -0.001) return { label: 'منفی (فشار خرید)', color: 'text-green-400' };
    return { label: 'عادی', color: 'text-muted-foreground' };
  };

  return (
    <div className="min-h-full">
      <Header
        title="مشتقات (Derivatives)"
        subtitle="Funding Rate · Open Interest · Long/Short — داده واقعی Binance"
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* هشدار */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300/90">
            <p>داده Funding Rate و Open Interest از <strong>Binance Futures Public API</strong> دریافت می‌شود. Options و Liquidation Stream نیاز به دسترسی Backend دارند.</p>
          </div>
        </div>

        {loading && data.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">دریافت داده مشتقات از Binance...</p>
          </div>
        ) : (
          <>
            {/* جدول اصلی */}
            <div className="glass-card overflow-x-auto">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />قراردادهای Perpetual</h3>
                {lastUpdate && <span className="text-xs text-muted-foreground">آپدیت: {lastUpdate.toLocaleTimeString('fa-IR')}</span>}
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/30">
                    <th className="text-right py-3 px-4">نماد</th>
                    <th className="text-right py-3 px-4">قیمت</th>
                    <th className="text-right py-3 px-4">تغییر ۲۴h</th>
                    <th className="text-right py-3 px-4">Funding Rate</th>
                    <th className="text-right py-3 px-4">Open Interest</th>
                    <th className="text-right py-3 px-4">Long/Short</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {data.map(row => {
                    const fs = fundingStatus(row.fundingRate);
                    return (
                      <tr key={row.symbol} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{row.symbol.replace('USDT', '')}</span>
                            <SourceBadge source={row.priceSource} />
                          </div>
                        </td>
                        <td className="py-3 px-4 number-display font-mono text-sm">
                          {row.price ? formatPrice(row.price) : <span className="text-muted-foreground text-xs">در دسترس نیست</span>}
                        </td>
                        <td className={cn('py-3 px-4 number-display text-sm font-medium',
                          row.priceChange !== null ? (row.priceChange >= 0 ? 'text-green-400' : 'text-red-400') : 'text-muted-foreground'
                        )}>
                          {row.priceChange !== null ? formatPercent(row.priceChange) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {row.fundingRate !== null ? (
                            <div>
                              <p className={cn('text-sm number-display font-mono', fs.color)}>
                                {(row.fundingRate * 100).toFixed(4)}%
                              </p>
                              <p className={cn('text-xs', fs.color)}>{fs.label}</p>
                            </div>
                          ) : (
                            <DataQualityBadge status="UNAVAILABLE" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {row.openInterest !== null ? (
                            <p className="text-sm number-display font-mono">
                              {formatNumber(row.openInterest)} <span className="text-xs text-muted-foreground">{row.symbol.replace('USDT', '')}</span>
                            </p>
                          ) : (
                            <DataQualityBadge status="UNAVAILABLE" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {row.longRatio !== null && row.shortRatio !== null ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-green-400">Long: {row.longRatio?.toFixed(1)}%</span>
                                <span className="text-xs text-red-400">Short: {row.shortRatio?.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-secondary overflow-hidden w-24">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.longRatio}%` }} />
                              </div>
                            </div>
                          ) : (
                            <DataQualityBadge status="UNAVAILABLE" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* کارت‌های توضیحی */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ExplainCard
                title="Funding Rate چیست؟"
                color="text-blue-400"
                items={[
                  'نرخ تأمین مالی به‌صورت دوره‌ای بین Long و Short جابجا می‌شود.',
                  'Funding مثبت: Long به Short می‌پردازد — فشار فروش',
                  'Funding منفی: Short به Long می‌پردازد — فشار خرید',
                  'Funding بسیار بالا: سیگنال احتیاط برای ورود Long',
                ]}
              />
              <ExplainCard
                title="Open Interest چیست؟"
                color="text-purple-400"
                items={[
                  'تعداد کل قراردادهای باز Futures که هنوز تسویه نشده‌اند.',
                  'OI بالا + قیمت بالا: جریان ورود خرید (Long Build-Up)',
                  'OI بالا + قیمت پایین: جریان ورود فروش (Short Build-Up)',
                  'OI پایین + قیمت بالا: بستن Short (Short Covering)',
                ]}
              />
              <ExplainCard
                title="Long/Short Ratio"
                color="text-cyan-400"
                items={[
                  'نسبت حساب‌های Long به Short در بازار Futures.',
                  'Long بالا: بازار بیش از حد صعودی است — احتمال اصلاح',
                  'Short بالا: بازار بیش از حد نزولی است — احتمال Short Squeeze',
                  'این اطلاعات تنها یکی از عوامل تحلیل است.',
                ]}
              />
            </div>

            {/* Options */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-muted-foreground">Options Intelligence</h3>
                <DataQualityBadge status="NOT_CONNECTED" />
              </div>
              <p className="text-sm text-muted-foreground">
                داده Options (IV، Put/Call Ratio، Max Pain، Skew) نیاز به دسترسی API اختصاصی دارد.
                در این نسخه پشتیبانی نمی‌شود.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExplainCard({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className="glass-card p-4">
      <h4 className={cn('font-semibold mb-3', color)}>{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="text-primary mt-0.5">•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}
