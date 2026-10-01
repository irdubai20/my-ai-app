// =========================================
// صفحه تحلیل تکنیکال — داده واقعی
// =========================================
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, AlertTriangle, Info, BarChart2, Layers } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge, SourceBadge, ForecastDirectionBadge, SignalDirectionBadge, MarketRegimeBadge } from '@/components/features/StatusBadge';
import { useAppStore } from '@/stores/appStore';
import { fetchBinanceCandles, fetchBinanceTicker } from '@/lib/api';
import { calculateFullIndicators, getRSIStatus, getMACDSignal, detectEMAStack } from '@/lib/indicators';
import { detectMarketRegime, evaluateEligibilityGate, generateForecast, generateSignal } from '@/lib/forecast';
import { formatPrice, formatPercent, cn, formatNumber } from '@/lib/utils';
import type { FullIndicatorResult } from '@/lib/indicators';
import type { ForecastResult, EnterpriseSignal, MarketRegime } from '@/types/intelligence';

const SYMBOLS = [
  { label: 'BTC/USDT', value: 'BTCUSDT', coinId: 'bitcoin' },
  { label: 'ETH/USDT', value: 'ETHUSDT', coinId: 'ethereum' },
  { label: 'BNB/USDT', value: 'BNBUSDT', coinId: 'binancecoin' },
  { label: 'SOL/USDT', value: 'SOLUSDT', coinId: 'solana' },
  { label: 'XRP/USDT', value: 'XRPUSDT', coinId: 'ripple' },
];

const TIMEFRAMES = [
  { label: '1h', value: '1h', limit: 200 },
  { label: '4h', value: '4h', limit: 200 },
  { label: '1روز', value: '1d', limit: 200 },
];

export default function TechnicalAnalysis() {
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [selectedTf, setSelectedTf] = useState(TIMEFRAMES[0]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'cache' | 'unavailable'>('unavailable');
  const [indicators, setIndicators] = useState<FullIndicatorResult | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [signal, setSignal] = useState<EnterpriseSignal | null>(null);
  const [regime, setRegime] = useState<MarketRegime>('UNKNOWN');
  const [tickerData, setTickerData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [candleRes, tickerRes] = await Promise.all([
        fetchBinanceCandles(selectedSymbol.value, selectedTf.value, selectedTf.limit),
        fetchBinanceTicker(selectedSymbol.value),
      ]);

      setDataSource(candleRes.source);
      setTickerData(tickerRes.data);

      if (candleRes.data.length > 0) {
        const ind = calculateFullIndicators(candleRes.data);
        setIndicators(ind);
        const reg = detectMarketRegime(candleRes.data, ind);
        setRegime(reg);
        const dq = candleRes.source !== 'unavailable' ? 'VALID' : 'STALE';
        const eli = evaluateEligibilityGate(ind, reg, dq, candleRes.data[candleRes.data.length - 1].close);
        const fc = generateForecast(selectedSymbol.value, candleRes.data, ind, reg, '1h');
        const sig = generateSignal(fc, ind, eli);
        setForecast(fc);
        setSignal(sig);
      } else {
        setIndicators(null);
        setForecast(null);
        setSignal(null);
      }
      setLastUpdate(new Date());
    } catch (err) {
      console.log('[TechnicalAnalysis] خطا:', err);
      setDataSource('unavailable');
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, selectedTf]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lastPrice = tickerData ? parseFloat(tickerData.lastPrice) : null;
  const priceChange = tickerData ? parseFloat(tickerData.priceChangePercent) : null;

  return (
    <div className="min-h-full">
      <Header
        title="تحلیل تکنیکال"
        subtitle="اندیکاتورهای واقعی از داده Binance"
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* هشدار صادقانه */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300/90">
            <strong>هشدار مهم:</strong> این سامانه پیش‌بینی قطعی ارائه نمی‌کند. تمام تحلیل‌ها مبتنی بر داده‌های موجود هستند و نتیجه واقعی بازار می‌تواند متفاوت باشد. اندیکاتورها از Binance Public API محاسبه می‌شوند.
          </p>
        </div>

        {/* انتخاب نماد و تایم‌فریم */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">نماد</p>
              <div className="flex gap-2 flex-wrap">
                {SYMBOLS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSymbol(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                      selectedSymbol.value === s.value
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">تایم‌فریم</p>
              <div className="flex gap-2">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setSelectedTf(tf)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                      selectedTf.value === tf.value
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mr-auto flex items-center gap-2">
              <SourceBadge source={dataSource} />
              {lastUpdate && <span className="text-xs text-muted-foreground">آپدیت: {lastUpdate.toLocaleTimeString('fa-IR')}</span>}
            </div>
          </div>
        </div>

        {/* قیمت و وضعیت کلی */}
        {lastPrice && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">قیمت فعلی</p>
              <p className="text-2xl font-bold number-display text-foreground">{formatPrice(lastPrice)}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">تغییر ۲۴ ساعت</p>
              <p className={cn('text-xl font-bold number-display', priceChange && priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                {priceChange !== null ? formatPercent(priceChange) : '—'}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">وضعیت بازار</p>
              <MarketRegimeBadge regime={regime} />
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">کیفیت داده</p>
              <DataQualityBadge status={indicators?.sufficientData ? 'VALID' : dataSource === 'unavailable' ? 'UNAVAILABLE' : 'INSUFFICIENT_DATA'} />
            </div>
          </div>
        )}

        {/* نمایش اندیکاتورها */}
        {loading ? (
          <div className="glass-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">در حال دریافت داده از Binance...</p>
          </div>
        ) : dataSource === 'unavailable' && !indicators ? (
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-1">داده بازار در دسترس نیست</p>
            <p className="text-xs text-muted-foreground/70">منبع داده پاسخ نمی‌دهد. ممکن است محدودیت Rate Limit فعال شده باشد.</p>
            <button onClick={loadData} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">تلاش مجدد</button>
          </div>
        ) : indicators ? (
          <>
            {/* اندیکاتورهای کلیدی */}
            <div className="glass-card">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />اندیکاتورهای کلیدی</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 divide-y divide-x divide-border/20">
                <IndicatorRow label="RSI(14)" value={indicators.rsi14} format="number" decimals={1}
                  status={indicators.rsi14 ? getRSIStatus(indicators.rsi14).label : '—'}
                  statusColor={indicators.rsi14 ? getRSIStatus(indicators.rsi14).color : 'text-muted-foreground'} />
                <IndicatorRow label="MACD" value={indicators.macd} format="number" decimals={4}
                  status={indicators.macd !== undefined && indicators.macdSignal !== undefined
                    ? getMACDSignal(indicators.macd!, indicators.macdSignal!, indicators.macdHistogram ?? 0) === 'BULLISH' ? 'صعودی' : getMACDSignal(indicators.macd!, indicators.macdSignal!, indicators.macdHistogram ?? 0) === 'BEARISH' ? 'نزولی' : 'خنثی'
                    : '—'}
                  statusColor={indicators.macd !== undefined && indicators.macdSignal !== undefined
                    ? getMACDSignal(indicators.macd!, indicators.macdSignal!, indicators.macdHistogram ?? 0) === 'BULLISH' ? 'text-green-400' : getMACDSignal(indicators.macd!, indicators.macdSignal!, indicators.macdHistogram ?? 0) === 'BEARISH' ? 'text-red-400' : 'text-muted-foreground'
                    : 'text-muted-foreground'} />
                <IndicatorRow label="ATR(14)" value={indicators.atr14} format="price" decimals={4} />
                <IndicatorRow label="EMA20" value={indicators.ema20} format="price" decimals={2} />
                <IndicatorRow label="EMA50" value={indicators.ema50} format="price" decimals={2} />
                <IndicatorRow label="EMA200" value={indicators.ema200} format="price" decimals={2}
                  status={!indicators.ema200 ? 'داده ناکافی' : undefined}
                  statusColor="text-muted-foreground" />
                <IndicatorRow label="Bollinger بالا" value={indicators.bollingerUpper} format="price" decimals={2} />
                <IndicatorRow label="Bollinger پایین" value={indicators.bollingerLower} format="price" decimals={2} />
                <IndicatorRow label="Bollinger Width" value={indicators.bollingerWidth} format="number" decimals={2}
                  status={indicators.bollingerWidth !== undefined ? (indicators.bollingerWidth < 2 ? 'فشردگی' : indicators.bollingerWidth > 8 ? 'انبساط' : 'عادی') : '—'} />
              </div>
            </div>

            {/* ساختار بازار */}
            <div className="glass-card">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold flex items-center gap-2"><BarChart2 className="w-4 h-4 text-accent" />ساختار بازار</h3>
              </div>
              <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StructureItem label="وضعیت" value={
                  indicators.structure.state === 'UPTREND' ? '▲ صعودی' :
                  indicators.structure.state === 'DOWNTREND' ? '▼ نزولی' :
                  indicators.structure.state === 'RANGE' ? '◈ رنج' : '? نامشخص'
                } color={
                  indicators.structure.state === 'UPTREND' ? 'text-green-400' :
                  indicators.structure.state === 'DOWNTREND' ? 'text-red-400' : 'text-muted-foreground'
                } />
                <StructureItem label="Higher High" value={indicators.structure.higherHigh ? 'بله ✓' : 'خیر ✗'} color={indicators.structure.higherHigh ? 'text-green-400' : 'text-red-400'} />
                <StructureItem label="Higher Low" value={indicators.structure.higherLow ? 'بله ✓' : 'خیر ✗'} color={indicators.structure.higherLow ? 'text-green-400' : 'text-red-400'} />
                <StructureItem label="EMA Stack" value={
                  indicators.ema20 && indicators.ema50 && indicators.ema200
                    ? detectEMAStack(indicators.ema20, indicators.ema50, indicators.ema200) === 'BULLISH' ? '▲ صعودی' : detectEMAStack(indicators.ema20, indicators.ema50, indicators.ema200) === 'BEARISH' ? '▼ نزولی' : '◆ خنثی'
                    : 'داده ناکافی'
                } color={
                  indicators.ema20 && indicators.ema50 && indicators.ema200
                    ? detectEMAStack(indicators.ema20, indicators.ema50, indicators.ema200) === 'BULLISH' ? 'text-green-400' : 'text-red-400'
                    : 'text-muted-foreground'
                } />
                {indicators.support1 && <StructureItem label="حمایت ۱" value={formatPrice(indicators.support1)} color="text-green-400" />}
                {indicators.support2 && <StructureItem label="حمایت ۲" value={formatPrice(indicators.support2)} color="text-green-400/70" />}
                {indicators.resistance1 && <StructureItem label="مقاومت ۱" value={formatPrice(indicators.resistance1)} color="text-red-400" />}
                {indicators.resistance2 && <StructureItem label="مقاومت ۲" value={formatPrice(indicators.resistance2)} color="text-red-400/70" />}
              </div>
            </div>

            {/* Forecast */}
            {forecast && (
              <div className="glass-card">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />Forecast
                    <DataQualityBadge status={forecast.dataQuality as any} />
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <ForecastDirectionBadge direction={forecast.direction} />
                    <span className="text-sm text-muted-foreground">اطمینان: <strong className="text-foreground">{forecast.confidence.toFixed(0)}%</strong></span>
                    <MarketRegimeBadge regime={forecast.marketRegime} />
                  </div>
                  {forecast.lowerBound && forecast.upperBound && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary">
                      <div>
                        <p className="text-xs text-muted-foreground">حد پایین</p>
                        <p className="text-sm font-mono text-red-400 number-display">{formatPrice(forecast.lowerBound)}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-xs text-muted-foreground">قیمت فعلی</p>
                        <p className="text-base font-bold number-display text-foreground">{formatPrice(forecast.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">حد بالا</p>
                        <p className="text-sm font-mono text-green-400 number-display">{formatPrice(forecast.upperBound)}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">دلایل:</p>
                    {forecast.reasons.map((r, i) => (
                      <p key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">•</span>{r}
                      </p>
                    ))}
                  </div>
                  {forecast.risks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">عوامل ریسک:</p>
                      {forecast.risks.map((r, i) => (
                        <p key={i} className="text-sm text-yellow-400/80 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{r}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground/60">موتور: {forecast.engineVersion} · مدل: {forecast.modelName} {forecast.modelVersion}</p>
                </div>
              </div>
            )}

            {/* Signal */}
            {signal && (
              <div className="glass-card">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-400" />سیگنال معاملاتی</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <SignalDirectionBadge direction={signal.direction} />
                    {signal.direction !== 'NO_ENTRY' && (
                      <span className="text-sm text-muted-foreground">اطمینان: <strong className="text-foreground">{signal.confidence.toFixed(0)}%</strong></span>
                    )}
                  </div>
                  {signal.direction !== 'NO_ENTRY' && signal.entry !== undefined ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      <TradeLevel label="ورود" value={formatPrice(signal.entry)} color="text-blue-400" />
                      <TradeLevel label="حد ضرر" value={signal.stopLoss ? formatPrice(signal.stopLoss) : '—'} color="text-red-400" />
                      <TradeLevel label="هدف ۱" value={signal.tp1 ? formatPrice(signal.tp1) : '—'} color="text-green-400" />
                      <TradeLevel label="هدف ۲" value={signal.tp2 ? formatPrice(signal.tp2) : '—'} color="text-green-300" />
                      <TradeLevel label="هدف ۳" value={signal.tp3 ? formatPrice(signal.tp3) : '—'} color="text-green-200" />
                      <TradeLevel label="R:R" value={signal.riskReward ? signal.riskReward.toFixed(2) + ':1' : '—'} color="text-primary" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        {signal.reasoning[0] ?? 'شرایط ورود مناسب نیست.'}
                      </p>
                    </div>
                  )}
                  {/* Eligibility Gate */}
                  <details className="group">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      ← نتایج دروازه واجد شرایط
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(signal.eligibilityGate.checks).map(([key, val]) => (
                        <div key={key} className={cn('flex items-center gap-2 p-2 rounded-lg text-xs', val ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400')}>
                          <span>{val ? '✓' : '✗'}</span>
                          <span>{key}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, format, decimals = 2, status, statusColor }: {
  label: string; value?: number; format: 'number' | 'price'; decimals?: number; status?: string; statusColor?: string;
}) {
  return (
    <div className="p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-semibold number-display text-foreground">
        {value !== undefined ? (format === 'price' ? `$${value.toFixed(decimals)}` : value.toFixed(decimals)) : '—'}
      </p>
      {status && <p className={cn('text-xs', statusColor ?? 'text-muted-foreground')}>{status}</p>}
    </div>
  );
}

function StructureItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-semibold mt-0.5', color)}>{value}</p>
    </div>
  );
}

function TradeLevel({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-secondary">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-mono font-bold mt-0.5 number-display', color)}>{value}</p>
    </div>
  );
}
