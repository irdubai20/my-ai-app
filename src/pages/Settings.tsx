// =========================================
// صفحه تنظیمات — Enterprise
// =========================================
import { useState } from 'react';
import { Settings as SettingsIcon, Save, Eye, EyeOff, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/stores/appStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { NetworkType, RiskLevel } from '@/types';

const NETWORKS: NetworkType[] = ['BSC', 'ETH', 'BASE'];
const RISK_LEVELS: RiskLevel[] = ['مناسب', 'متوسط', 'ضعیف', 'مشکوک'];

export default function Settings() {
  const { settings, updateSettings } = useAppStore();
  const [form, setForm] = useState(settings);
  const [showToken, setShowToken] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    toast.success('تنظیمات ذخیره شد');
  };

  const toggleNetwork = (net: NetworkType) => {
    setForm(prev => ({
      ...prev,
      scanner: {
        ...prev.scanner,
        networks: prev.scanner.networks.includes(net)
          ? prev.scanner.networks.filter(n => n !== net)
          : [...prev.scanner.networks, net],
      },
    }));
  };

  const toggleRisk = (risk: RiskLevel) => {
    setForm(prev => ({
      ...prev,
      scanner: {
        ...prev.scanner,
        riskFilter: prev.scanner.riskFilter.includes(risk)
          ? prev.scanner.riskFilter.filter(r => r !== risk)
          : [...prev.scanner.riskFilter, risk],
      },
    }));
  };

  return (
    <div className="min-h-full">
      <Header title="تنظیمات" subtitle="پیکربندی سامانه" />

      <div className="p-4 lg:p-6 space-y-5">
        {/* هشدار امنیتی */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300/90">
            <strong>هشدار امنیتی:</strong> Bot Token تلگرام هرگز در Frontend ذخیره نشود. در محیط Production از Backend برای ارتباط با Telegram استفاده کنید.
          </p>
        </div>

        {/* تلگرام */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-primary" />تلگرام</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Bot Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={form.telegram.botToken}
                  onChange={e => setForm(prev => ({ ...prev, telegram: { ...prev.telegram, botToken: e.target.value } }))}
                  placeholder="۱۲۳۴۵۶۷:ABCdefGHI..."
                  dir="ltr"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={() => setShowToken(!showToken)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Chat ID</label>
              <input
                type="text"
                value={form.telegram.chatId}
                onChange={e => setForm(prev => ({ ...prev, telegram: { ...prev.telegram, chatId: e.target.value } }))}
                placeholder="-100123456789"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'enabled', label: 'فعال' },
              { key: 'sendSignals', label: 'ارسال سیگنال' },
              { key: 'sendAlerts', label: 'ارسال هشدار' },
              { key: 'sendHealth', label: 'گزارش سلامت' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form.telegram as any)[key]}
                  onChange={e => setForm(prev => ({ ...prev, telegram: { ...prev.telegram, [key]: e.target.checked } }))}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* اسکنر */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">اسکنر</h3>
          <div>
            <p className="text-sm text-muted-foreground mb-2">شبکه‌ها:</p>
            <div className="flex gap-2 flex-wrap">
              {NETWORKS.map(net => (
                <button key={net} onClick={() => toggleNetwork(net)}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                    form.scanner.networks.includes(net) ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {net}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">فیلتر ریسک:</p>
            <div className="flex gap-2 flex-wrap">
              {RISK_LEVELS.map(risk => (
                <button key={risk} onClick={() => toggleRisk(risk)}
                  className={cn('px-3 py-1.5 rounded-lg text-sm border transition-all',
                    form.scanner.riskFilter.includes(risk) ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {risk}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">حداقل نقدینگی ($)</label>
              <input type="number" value={form.scanner.minLiquidity}
                onChange={e => setForm(prev => ({ ...prev, scanner: { ...prev.scanner, minLiquidity: parseInt(e.target.value) } }))}
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary" dir="ltr" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">حداقل کیف‌پول هوشمند</label>
              <input type="number" value={form.scanner.minSmartWallets}
                onChange={e => setForm(prev => ({ ...prev, scanner: { ...prev.scanner, minSmartWallets: parseInt(e.target.value) } }))}
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary" dir="ltr" />
            </div>
          </div>
        </div>

        {/* RPC */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">RPC Endpoints</h3>
          {[
            { key: 'bsc', label: 'BSC RPC', placeholder: 'https://bsc-dataseed.binance.org/' },
            { key: 'eth', label: 'Ethereum RPC', placeholder: 'https://cloudflare-eth.com' },
            { key: 'base', label: 'Base RPC', placeholder: 'https://mainnet.base.org' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-sm text-muted-foreground block mb-1.5">{label}</label>
              <input type="url" value={(form.rpc as any)[key]}
                onChange={e => setForm(prev => ({ ...prev, rpc: { ...prev.rpc, [key]: e.target.value } }))}
                placeholder={placeholder} dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          ))}
        </div>

        {/* دکمه ذخیره */}
        <button onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all">
          <Save className="w-4 h-4" />
          ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
}
