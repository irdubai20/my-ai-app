// =========================================
// صفحه عملکرد Forecast
// Forecast Performance + Verification
// =========================================
import { useState } from 'react';
import { Target, CheckCircle, XCircle, Clock, AlertTriangle, Info, BarChart2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge } from '@/components/features/StatusBadge';
import { cn } from '@/lib/utils';

// ساختار نگهداری پیش‌بینی‌ها در localStorage
const STORAGE_KEY = 'forecast_history';

interface StoredForecast {
  id: string;
  symbol: string;
  direction: 'UP' | 'DOWN' | 'NEUTRAL' | 'UNKNOWN';
  predictedPrice?: number;
  currentPrice: number;
  confidence: number;
  createdAt: string;
  expiresAt: string;
  horizon: string;
  status: 'ACTIVE' | 'EXPIRED' | 'VERIFIED' | 'INVALIDATED';
  actualPrice?: number;
  directionCorrect?: boolean;
  percentageError?: number;
  modelName: string;
  dataQuality: string;
}

export default function ForecastPerformance() {
  const [forecasts] = useState<StoredForecast[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const verified = forecasts.filter(f => f.status === 'VERIFIED');
  const active = forecasts.filter(f => f.status === 'ACTIVE');
  const expired = forecasts.filter(f => f.status === 'EXPIRED');

  const directionAccuracy = verified.length > 0
    ? (verified.filter(f => f.directionCorrect).length / verified.length) * 100
    : null;

  const avgError = verified.length > 0 && verified.some(f => f.percentageError !== undefined)
    ? verified.filter(f => f.percentageError !== undefined).reduce((s, f) => s + (f.percentageError ?? 0), 0) / verified.filter(f => f.percentageError !== undefined).length
    : null;

  const metricsQuality = verified.length >= 10 ? 'VALID' : verified.length >= 5 ? 'INSUFFICIENT_DATA' : 'INSUFFICIENT_DATA';

  return (
    <div className="min-h-full">
      <Header title="عملکرد Forecast" subtitle="ارزیابی دقت پیش‌بینی‌ها" />

      <div className="p-4 lg:p-6 space-y-5">
        {/* هشدار */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300/90">
            <p>Forecast Verification پس از پایان Horizon اجرا می‌شود. قیمت واقعی از Binance دریافت می‌شود و خطا محاسبه می‌شود. هیچ داده ساختگی در محاسبات استفاده نمی‌شود.</p>
          </div>
        </div>

        {/* آمار کلی */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="کل Forecast" value={forecasts.length.toString()} desc="کل پیش‌بینی‌های صادرشده" />
          <MetricCard title="تأیید شده" value={verified.length.toString()} desc="Forecast با Verification" />
          <MetricCard title="در انتظار" value={(active.length + expired.length).toString()} desc="فعال + منقضی‌شده" />
          <MetricCard title="دقت جهت"
            value={directionAccuracy !== null ? directionAccuracy.toFixed(1) + '%' : '—'}
            desc={verified.length < 10 ? 'داده کافی نیست (کمتر از ۱۰)' : 'Direction Accuracy'}
            quality={metricsQuality as any} />
        </div>

        {/* معیارهای عملکرد */}
        <div className="glass-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              معیارهای عملکرد
              <DataQualityBadge status={metricsQuality as any} />
            </h3>
          </div>
          {verified.length < 5 ? (
            <div className="p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">داده کافی برای محاسبه شاخص‌ها وجود ندارد</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                حداقل ۱۰ Forecast تأیید شده برای محاسبه معیارهای معنادار نیاز است.
                در حال حاضر {verified.length} Forecast تأیید شده وجود دارد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-y divide-x divide-border/20">
              {[
                { label: 'MAE', value: avgError !== null ? avgError.toFixed(2) + '%' : '—', desc: 'میانگین خطای مطلق' },
                { label: 'Direction Accuracy', value: directionAccuracy !== null ? directionAccuracy.toFixed(1) + '%' : '—', desc: 'دقت تشخیص جهت' },
                { label: 'تعداد نمونه', value: verified.length.toString(), desc: 'برای محاسبه' },
                { label: 'وضعیت مدل', value: 'PRODUCTION', desc: 'TechnicalEnsemble v1.0' },
              ].map(m => (
                <div key={m.label} className="p-4">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold text-foreground number-display mt-0.5">{m.value}</p>
                  <p className="text-xs text-muted-foreground/70">{m.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* تاریخچه Forecast */}
        <div className="glass-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              تاریخچه Forecast
            </h3>
          </div>
          {forecasts.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">هنوز Forecast ثبت نشده است.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">برای تولید Forecast به صفحه «تحلیل تکنیکال» بروید.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/30">
                    <th className="text-right py-3 px-4">نماد</th>
                    <th className="text-right py-3 px-4">جهت</th>
                    <th className="text-right py-3 px-4">اطمینان</th>
                    <th className="text-right py-3 px-4">وضعیت</th>
                    <th className="text-right py-3 px-4">نتیجه</th>
                    <th className="text-right py-3 px-4">کیفیت داده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {forecasts.slice(0, 20).map(fc => (
                    <tr key={fc.id} className="hover:bg-secondary/20">
                      <td className="py-3 px-4 font-semibold text-sm">{fc.symbol}</td>
                      <td className="py-3 px-4">
                        <span className={cn('text-sm font-medium', fc.direction === 'UP' ? 'text-green-400' : fc.direction === 'DOWN' ? 'text-red-400' : 'text-muted-foreground')}>
                          {fc.direction === 'UP' ? '▲ صعودی' : fc.direction === 'DOWN' ? '▼ نزولی' : fc.direction === 'NEUTRAL' ? '◆ خنثی' : '? نامشخص'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm number-display">{fc.confidence.toFixed(0)}%</td>
                      <td className="py-3 px-4">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border',
                          fc.status === 'ACTIVE' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          fc.status === 'VERIFIED' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-muted border-border text-muted-foreground'
                        )}>{fc.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        {fc.directionCorrect !== undefined ? (
                          fc.directionCorrect
                            ? <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle className="w-3.5 h-3.5" />صحیح</span>
                            : <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" />نادرست</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">در انتظار</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <DataQualityBadge status={fc.dataQuality as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Forecast Governance */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-primary mb-3">Forecast Governance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">ویژگی‌های موتور:</p>
              <p>• مدل: TechnicalEnsemble v1.0.0</p>
              <p>• موتور: EnterpriseSignalEngine v1.0.0</p>
              <p>• Horizon پیش‌فرض: 1 ساعت</p>
              <p>• Eligibility Gate: فعال</p>
              <p>• Dynamic Stop Loss: بر اساس ATR</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">ضمانت‌ها:</p>
              <p>• بدون Math.random()</p>
              <p>• بدون Hardcoded Signal</p>
              <p>• Actual Price از بازار واقعی</p>
              <p>• Verification خودکار پس از Horizon</p>
              <p>• Data Quality Gate برای هر Forecast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, desc, quality }: {
  title: string; value: string; desc: string; quality?: any;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        {quality && <DataQualityBadge status={quality} />}
      </div>
      <p className="text-2xl font-bold text-foreground number-display">{value}</p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">{desc}</p>
    </div>
  );
}
