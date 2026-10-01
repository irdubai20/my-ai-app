// =========================================
// صفحه کیف پول هوشمند — Smart Money
// =========================================
import { useState } from 'react';
import { Wallet, Search, Info, AlertTriangle, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge } from '@/components/features/StatusBadge';
import EmptyState from '@/components/features/EmptyState';
import { cn } from '@/lib/utils';

const SM_MODULES = [
  { id: 'wallet-discovery', title: 'Wallet Discovery', desc: 'شناسایی کیف‌پول‌های جدید از تراکنش‌های بلاکچین', status: 'NOT_CONNECTED' },
  { id: 'wallet-validation', title: 'Wallet Validation', desc: 'اعتبارسنجی عملکرد تاریخی کیف‌پول', status: 'NOT_CONNECTED' },
  { id: 'trade-analysis', title: 'Trade Analysis', desc: 'تحلیل الگوی معاملات و سابقه P&L', status: 'NOT_CONNECTED' },
  { id: 'pnl-analysis', title: 'PnL Analysis', desc: 'محاسبه سود، زیان و نرخ برد واقعی', status: 'NOT_CONNECTED' },
  { id: 'wallet-ranking', title: 'Wallet Ranking', desc: 'رتبه‌بندی براساس معیارهای قابل‌اندازه‌گیری', status: 'NOT_CONNECTED' },
  { id: 'cluster-detection', title: 'Cluster Detection', desc: 'شناسایی گروه‌های مرتبط از کیف‌پول‌ها', status: 'NOT_CONNECTED' },
  { id: 'signal-eval', title: 'Signal Evaluation', desc: 'ارزیابی کیفیت سیگنال از Smart Money', status: 'NOT_CONNECTED' },
  { id: 'risk-eval', title: 'Risk Evaluation', desc: 'ارزیابی ریسک براساس رفتار کیف‌پول', status: 'NOT_CONNECTED' },
];

export default function SmartMoney() {
  const [address, setAddress] = useState('');

  return (
    <div className="min-h-full">
      <Header title="کیف پول هوشمند" subtitle="Smart Money Detection — نیاز به Blockchain Backend" />

      <div className="p-4 lg:p-6 space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300/90">
            <p className="font-medium mb-1">نیاز به Blockchain Backend</p>
            <p>تمام ماژول‌های Smart Money نیاز به Blockchain Indexer و دسترسی به تراکنش‌های واقعی دارند. در این محیط (Frontend Only) این قابلیت‌ها پیکربندی نشده‌اند.</p>
          </div>
        </div>

        {/* جستجوی آدرس */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-primary" />جستجوی آدرس کیف‌پول</h3>
          <div className="flex gap-3">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="0x... آدرس کیف‌پول را وارد کنید"
              className="flex-1 px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              dir="ltr"
            />
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-primary/30 text-primary font-medium text-sm cursor-not-allowed opacity-50"
            >
              تحلیل
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <DataQualityBadge status="NOT_CONNECTED" /> — برای تحلیل آدرس، Backend Node.js لازم است.
          </p>
        </div>

        {/* ماژول‌ها */}
        <div className="glass-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" />ماژول‌های Smart Money</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-x divide-border/20">
            {SM_MODULES.map(mod => (
              <div key={mod.id} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-muted-foreground">{mod.title}</p>
                    <DataQualityBadge status={mod.status as any} />
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* قانون Smart Money */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />قانون Smart Money
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Smart Money فقط بر اساس معیارهای قابل اثبات شناسایی می‌شود.</p>
            <p>• هر Wallet بزرگ به‌صورت خودکار Smart Money محسوب نمی‌شود.</p>
            <p>• حداقل شرط: تعداد معامله، نرخ برد، حجم، ثبات عملکرد.</p>
            <p>• در نبود داده کافی: INSUFFICIENT_HISTORY نمایش داده می‌شود.</p>
            <p>• هرگز داده ساختگی جایگزین داده واقعی نمی‌شود.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
