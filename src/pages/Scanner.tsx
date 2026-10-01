// =========================================
// صفحه اسکنر توکن
// =========================================
import { useState, useRef } from 'react';
import { Scan, Play, Pause, Square, RefreshCw, CheckCircle, Clock, Zap, Info, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { NetworkBadge, DataQualityBadge } from '@/components/features/StatusBadge';
import EmptyState from '@/components/features/EmptyState';
import { useAppStore } from '@/stores/appStore';
import { getScanRuns, addScanRun, updateScanRun } from '@/lib/storage';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { ScanRun, NetworkType } from '@/types';
import { toast } from 'sonner';

const NETWORKS: NetworkType[] = ['BSC', 'ETH', 'BASE'];

const PIPELINE_STEPS = [
  'کشف توکن‌ها (Simulated)',
  'اعتبارسنجی',
  'نرمال‌سازی',
  'شناسایی شبکه',
  'بررسی نقدینگی',
  'حذف تکراری',
  'صف پردازش',
  'تحلیل',
  'ذخیره‌سازی',
];

export default function Scanner() {
  const { scanStatus, setScanStatus, settings, addNewAlert } = useAppStore();
  const [scanRuns, setScanRuns] = useState<ScanRun[]>(() => getScanRuns());
  const [activeRun, setActiveRun] = useState<ScanRun | null>(null);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [selectedNetworks, setSelectedNetworks] = useState<NetworkType[]>(settings.scanner.networks);
  const stepIntervalRef = useRef<number | null>(null);

  const isRunning = scanStatus === 'در حال اجرا';
  const isPaused = scanStatus === 'مکث';

  const startScan = () => {
    if (isRunning) return;
    setScanStatus('در حال اجرا');
    setPipelineStep(0);

    const run = addScanRun({
      startedAt: new Date(),
      status: 'در حال اجرا',
      tokensDiscovered: 0,
      walletsAnalyzed: 0,
      signalsGenerated: 0,
      networks: selectedNetworks,
      errors: [],
    });

    setActiveRun(run);
    setScanRuns(getScanRuns());

    let step = 0;
    stepIntervalRef.current = window.setInterval(() => {
      step++;
      setPipelineStep(step);
      if (step >= PIPELINE_STEPS.length) {
        clearInterval(stepIntervalRef.current!);
        const count = Math.floor(5 + Math.abs(Date.now() % 35));
        const wallets = Math.floor(20 + Math.abs(Date.now() % 180));
        const sigs = Math.floor(Math.abs(Date.now() % 4));
        const updates = { status: 'متوقف' as const, endedAt: new Date(), tokensDiscovered: count, walletsAnalyzed: wallets, signalsGenerated: sigs };
        updateScanRun(run.id, updates);
        setScanStatus('آماده');
        setPipelineStep(-1);
        setActiveRun(null);
        setScanRuns(getScanRuns());
        addNewAlert({ type: 'اطلاعات', title: 'اسکن کامل شد', message: `اسکن ${selectedNetworks.join('، ')}: ${count} توکن، ${wallets} کیف‌پول` });
        toast.success('اسکن کامل شد');
      }
    }, 1200);
  };

  const stopScan = () => {
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    setScanStatus('متوقف');
    setPipelineStep(-1);
    if (activeRun) { updateScanRun(activeRun.id, { status: 'متوقف', endedAt: new Date() }); setActiveRun(null); }
    setScanRuns(getScanRuns());
    toast.info('اسکن متوقف شد');
  };

  const pauseScan = () => { if (!isRunning) return; setScanStatus('مکث'); if (stepIntervalRef.current) clearInterval(stepIntervalRef.current); toast.info('اسکن مکث شد'); };
  const resumeScan = () => { if (!isPaused) return; setScanStatus('در حال اجرا'); toast.info('ادامه یافت'); };
  const toggleNetwork = (net: NetworkType) => setSelectedNetworks(prev => prev.includes(net) ? prev.filter(n => n !== net) : [...prev, net]);

  return (
    <div className="min-h-full">
      <Header title="اسکنر توکن" subtitle="Discovery Pipeline — کشف خودکار توکن‌ها" />

      <div className="p-4 lg:p-6 space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300/90">
            <p className="font-medium">موتور اسکن در این محیط (Frontend Only) به‌صورت Simulation اجرا می‌شود.</p>
            <p className="mt-1 text-blue-300/70">برای اسکن واقعی بلاکچین و تحلیل کیف‌پول، Backend Node.js با دسترسی به RPC لازم است.</p>
          </div>
        </div>

        {/* کنترل */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Scan className="w-4 h-4 text-primary" />کنترل اسکنر</h3>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">شبکه‌ها:</p>
            <div className="flex gap-2 flex-wrap">
              {NETWORKS.map(net => (
                <button key={net} onClick={() => !isRunning && toggleNetwork(net)} disabled={isRunning}
                  className={cn('px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                    selectedNetworks.includes(net) ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary border-border text-muted-foreground hover:text-foreground',
                    isRunning && 'opacity-50 cursor-not-allowed'
                  )}>
                  {net}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={startScan} disabled={isRunning || isPaused || selectedNetworks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
              <Play className="w-4 h-4" />شروع
            </button>
            <button onClick={isPaused ? resumeScan : pauseScan} disabled={!isRunning && !isPaused}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-medium text-sm hover:bg-yellow-500/30 disabled:opacity-50 transition-all">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'ادامه' : 'مکث'}
            </button>
            <button onClick={stopScan} disabled={!isRunning && !isPaused}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-medium text-sm hover:bg-red-500/30 disabled:opacity-50 transition-all">
              <Square className="w-4 h-4" />توقف
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-green-400 animate-pulse' : isPaused ? 'bg-yellow-400 animate-pulse' : 'bg-muted-foreground')} />
            <span className="text-sm text-muted-foreground">وضعیت: <span className="text-foreground font-medium">{scanStatus}</span></span>
          </div>
        </div>

        {/* Pipeline Progress */}
        {isRunning && pipelineStep >= 0 && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary animate-spin" />خط پردازش</h3>
            <div className="space-y-2">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    i < pipelineStep ? 'bg-green-500/20 text-green-400' :
                    i === pipelineStep ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  )}>
                    {i < pipelineStep ? <CheckCircle className="w-3.5 h-3.5" /> :
                     i === pipelineStep ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                     <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn('text-sm',
                    i < pipelineStep ? 'text-green-400' :
                    i === pipelineStep ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>{step}</span>
                  {i === pipelineStep && <span className="text-xs text-primary animate-pulse">در حال اجرا...</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تاریخچه */}
        <div className="glass-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />تاریخچه اسکن</h3>
          </div>
          {scanRuns.length === 0 ? (
            <EmptyState icon={Scan} title="هنوز اسکنی اجرا نشده" description="برای شروع، دکمه شروع را بزنید." />
          ) : (
            <div className="divide-y divide-border/30">
              {scanRuns.slice(0, 10).map(run => (
                <div key={run.id} className="flex items-center gap-4 p-4 hover:bg-secondary/20">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    run.status === 'متوقف' ? 'bg-green-500/10' : 'bg-red-500/10'
                  )}>
                    {run.status === 'متوقف' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-sm font-medium', run.status === 'متوقف' ? 'text-green-400' : 'text-red-400')}>{run.status}</span>
                      {run.networks.map(n => <NetworkBadge key={n} network={n} />)}
                    </div>
                    <p className="text-xs text-muted-foreground">{run.tokensDiscovered} توکن · {run.walletsAnalyzed} کیف‌پول · {run.signalsGenerated} سیگنال</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">{formatRelativeTime(run.startedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
