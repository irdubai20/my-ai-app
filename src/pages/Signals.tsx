// =========================================
// صفحه سیگنال‌ها — Enterprise Signal Engine
// =========================================
import { useState, useCallback } from 'react';
import { Zap, RefreshCw, Info, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge, SourceBadge, SignalDirectionBadge, MarketRegimeBadge, ForecastDirectionBadge } from '@/components/features/StatusBadge';
import { fetchBinanceCandles } from '@/lib/api';
import { calculateFullIndicators } from '@/lib/indicators';
import { detectMarketRegime, evaluateEligibilityGate, generateForecast, generateSignal } from '@/lib/forecast';
import { formatPrice, formatPercent, cn } from '@/lib/utils';
import type { EnterpriseSignal, ForecastResult } from '@/types/intelligence';

const WATCHLIST = [
  { label: 'BTC/USDT', value: 'BTCUSDT' },
  { label: 'ETH/USDT', value: 'ETHUSDT' },
  { label: 'BNB/USDT', value: 'BNBUSDT' },
  { label: 'SOL/USDT', value: 'SOLUSDT' },
  { label: 'XRP/USDT', value: 'XRPUSDT' },
];

interface SignalResult {
  symbol: string;
  signal: EnterpriseSignal;
  forecast: ForecastResult;
  candleSource: 'live' | 'cache' | 'unavailable';
}

export default function Signals() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SignalResult[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    const allResults: SignalResult[] = [];

    for (const sym of WATCHLIST) {
      const res = await fetchBinanceCandles(sym.value, '1h', 200);
      if (res.data.length > 10) {
        const ind = calculateFullIndicators(res.data);
        const regime = detectMarketRegime(res.data, ind);
        const dq = res.source !== 'unavailable' ? 'VALID' : 'STALE';
        const eli = evaluateEligibilityGate(ind, regime, dq, res.data[res.data.length - 1].close);
        const fc = generateForecast(sym.value, res.data, ind, regime, '1h');
        const sig = generateSignal(fc, ind, eli);
        allResults.push({ symbol: sym.value, signal: sig, forecast: fc, candleSource: res.source });
      }
    }

    setResults(allResults);
    setLastUpdate(new Date());
    setLoading(false);
    setAnalyzed(true);
  }, []);

  const buySignals = results.filter(r => r.signal.direction === 'BUY');
  const sellSignals = results.filter(r => r.signal.direction === 'SELL');
  const noEntrySignals = results.filter(r => r.signal.direction === 'NO_ENTRY');

  return (
    <div className="min-h-full">
      <Header
        title="سیگنال‌ها"
        subtitle="موتور سیگنال سازمانی — BUY / SELL / NO_ENTRY"
        onRefresh={runAnalysis}
        isRefreshing={loading}
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* هشدار */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300/90">
            <p className="font-medium mb-1">هشدار مهم</p>
            <p>این سامانه پیش‌بینی قطعی ارائه نمی‌دهد. سیگنال‌ها از تحلیل تکنیکال واقعی تولید می‌شوند. هیچ سیگنالی تضمین سود نیست. قبل از هر معامله تحقیق کامل انجام دهید.</p>
          </div>
        </div>

        {/* Eligibility Gate توضیح */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300/90">
            سیگنال‌ها از Eligibility Gate عبور می‌کنند: Data Quality + Trend Confirmation + Momentum + Risk/Reward. اگر شرایط برقرار نبود، «عدم ورود» صادر می‌شود.
          </p>
        </div>

        {!analyzed ? (
          <div className="glass-card p-12 text-center">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold text-foreground mb-2">تحلیل شروع نشده</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              برای دریافت سیگنال از داده واقعی Binance، دکمه «بروزرسانی» را بزنید.
              موتور تحلیل تکنیکال تمام نمادهای واچ‌لیست را بررسی می‌کند.
            </p>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium mx-auto hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? 'در حال تحلیل...' : 'شروع تحلیل'}
            </button>
          </div>
        ) : loading ? (
          <div className="glass-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">تحلیل {WATCHLIST.length} نماد در حال انجام است...</p>
          </div>
        ) : (
          <>
            {/* خلاصه */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center border-green-500/20">
                <p className="text-3xl font-bold text-green-400">{buySignals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">سیگنال خرید</p>
              </div>
              <div className="glass-card p-4 text-center border-red-500/20">
                <p className="text-3xl font-bold text-red-400">{sellSignals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">سیگنال فروش</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-muted-foreground">{noEntrySignals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">عدم ورود</p>
              </div>
            </div>

            {/* سیگنال‌ها */}
            {results.map(({ symbol, signal, forecast, candleSource }) => (
              <div key={symbol} className={cn(
                'glass-card overflow-hidden',
                signal.direction === 'BUY' ? 'border-green-500/20' :
                signal.direction === 'SELL' ? 'border-red-500/20' : ''
              )}>
                <div className="flex items-center gap-4 p-4 border-b border-border/30">
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <span className="font-bold text-lg text-foreground">{symbol.replace('USDT', '/USDT')}</span>
                    <SignalDirectionBadge direction={signal.direction} />
                    <ForecastDirectionBadge direction={forecast.direction} />
                    <MarketRegimeBadge regime={forecast.marketRegime} />
                    <SourceBadge source={candleSource} />
                    <DataQualityBadge status={signal.dataQuality} />
                  </div>
                  {signal.confidence > 0 && (
                    <div className="text-left flex-shrink-0">
                      <p className="text-xs text-muted-foreground">اطمینان</p>
                      <p className="text-lg font-bold text-foreground number-display">{signal.confidence.toFixed(0)}%</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {signal.direction !== 'NO_ENTRY' && signal.entry !== undefined ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'ورود', v: signal.entry ? formatPrice(signal.entry) : '—', color: 'text-blue-400' },
                        { label: 'حد ضرر', v: signal.stopLoss ? formatPrice(signal.stopLoss) : '—', color: 'text-red-400' },
                        { label: 'هدف ۱', v: signal.tp1 ? formatPrice(signal.tp1) : '—', color: 'text-green-400' },
                        { label: 'هدف ۲', v: signal.tp2 ? formatPrice(signal.tp2) : '—', color: 'text-green-300' },
                        { label: 'هدف ۳', v: signal.tp3 ? formatPrice(signal.tp3) : '—', color: 'text-green-200' },
                        { label: 'R:R', v: signal.riskReward ? signal.riskReward.toFixed(2) + ':1' : '—', color: 'text-primary' },
                      ].map(item => (
                        <div key={item.label} className="p-2.5 rounded-xl bg-secondary/50">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className={cn('text-sm font-mono font-bold mt-0.5 number-display', item.color)}>{item.v}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">{signal.reasoning[0] ?? 'شرایط ورود مناسب نیست.'}</p>
                    </div>
                  )}

                  {/* دلایل */}
                  {signal.reasoning.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">دلایل:</p>
                      {signal.reasoning.slice(0, 3).map((r, i) => (
                        <p key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>{r}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Eligibility checks */}
                  <details className="mt-3 group">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">← Eligibility Gate نتایج</summary>
                    <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                      {Object.entries(signal.eligibilityGate.checks).map(([key, val]) => (
                        <div key={key} className={cn('flex items-center gap-1.5 p-2 rounded-lg text-xs', val ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400')}>
                          {val ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <XCircle className="w-3 h-3 flex-shrink-0" />}
                          <span className="truncate">{key}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))}

            {lastUpdate && (
              <p className="text-xs text-muted-foreground text-center flex items-center gap-1 justify-center">
                <Clock className="w-3 h-3" />
                آخرین تحلیل: {lastUpdate.toLocaleTimeString('fa-IR')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
