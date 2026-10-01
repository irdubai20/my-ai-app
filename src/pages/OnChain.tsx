// =========================================
// صفحه OnChain Intelligence
// داده On-Chain از منابع عمومی
// =========================================
import { useState, useEffect, useCallback } from 'react';
import { Link2, RefreshCw, AlertTriangle, Info, Server } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge } from '@/components/features/StatusBadge';
import { checkRpcHealth } from '@/lib/api';
import { cn } from '@/lib/utils';

const CHAINS = [
  { name: 'BNB Chain', chainId: 56, rpc: 'https://bsc-dataseed.binance.org/', symbol: 'BNB', color: '#F3BA2F' },
  { name: 'Ethereum', chainId: 1, rpc: 'https://cloudflare-eth.com', symbol: 'ETH', color: '#627EEA' },
  { name: 'Base', chainId: 8453, rpc: 'https://mainnet.base.org', symbol: 'ETH', color: '#0052FF' },
];

interface ChainStatus {
  name: string;
  ok: boolean;
  latency: number;
  blockNumber?: string;
  checking: boolean;
}

const ONCHAIN_MODULES = [
  { title: 'Active Addresses', desc: 'تعداد آدرس‌های فعال در شبکه', status: 'NOT_CONNECTED', need: 'نیاز به Blockchain Indexer' },
  { title: 'Exchange Inflow/Outflow', desc: 'جریان سرمایه به/از صرافی‌ها', status: 'NOT_CONNECTED', need: 'نیاز به Address Label DB' },
  { title: 'Whale Transactions', desc: 'تراکنش‌های بزرگ نهنگ‌ها', status: 'NOT_CONNECTED', need: 'نیاز به Transaction Monitor' },
  { title: 'Smart Money Detection', desc: 'شناسایی کیف‌پول‌های هوشمند', status: 'NOT_CONNECTED', need: 'نیاز به Wallet Analytics Backend' },
  { title: 'Token Holder Intelligence', desc: 'توزیع هولدرها و تمرکز', status: 'NOT_CONNECTED', need: 'نیاز به Blockchain API' },
  { title: 'Cross-Chain Flow', desc: 'جریان دارایی بین شبکه‌ها', status: 'NOT_CONNECTED', need: 'نیاز به Bridge Monitor' },
  { title: 'Wallet Clustering', desc: 'خوشه‌بندی کیف‌پول‌های مرتبط', status: 'NOT_CONNECTED', need: 'نیاز به Graph Analysis Backend' },
  { title: 'Address Reputation', desc: 'اعتبار و سابقه آدرس', status: 'NOT_CONNECTED', need: 'نیاز به Reputation Database' },
];

export default function OnChain() {
  const [chainStatuses, setChainStatuses] = useState<ChainStatus[]>(
    CHAINS.map(c => ({ name: c.name, ok: false, latency: 0, checking: true }))
  );

  const checkChains = useCallback(async () => {
    setChainStatuses(prev => prev.map(s => ({ ...s, checking: true })));
    const results = await Promise.all(
      CHAINS.map(async (chain) => {
        const res = await checkRpcHealth(chain.rpc);
        return { name: chain.name, ok: res.ok, latency: res.latency, blockNumber: res.blockNumber, checking: false };
      })
    );
    setChainStatuses(results);
  }, []);

  useEffect(() => { checkChains(); }, [checkChains]);

  return (
    <div className="min-h-full">
      <Header
        title="هوش On-Chain"
        subtitle="داده بلاکچین و تراکنش‌های On-Chain"
        onRefresh={checkChains}
      />

      <div className="p-4 lg:p-6 space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300/90">
            <p className="font-medium mb-1">محدودیت این محیط</p>
            <p>تحلیل‌های On-Chain کامل (Exchange Flow، Whale Tracking، Smart Money) نیاز به Backend Node.js با Blockchain Indexer دارند. در این نسخه فقط بررسی اتصال به RPC عمومی پشتیبانی می‌شود.</p>
          </div>
        </div>

        {/* وضعیت اتصال شبکه‌ها */}
        <div className="glass-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" />اتصال به RPC عمومی</h3>
          </div>
          <div className="divide-y divide-border/30">
            {CHAINS.map((chain, i) => {
              const status = chainStatuses[i];
              return (
                <div key={chain.name} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: chain.color + '20', border: `1px solid ${chain.color}40` }}>
                    <span className="text-xs font-bold" style={{ color: chain.color }}>{chain.symbol}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{chain.name}</p>
                      <span className="text-xs text-muted-foreground font-mono">Chain ID: {chain.chainId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{chain.rpc}</p>
                  </div>
                  <div className="text-left flex-shrink-0 space-y-1">
                    {status.checking ? (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        <span className="text-xs text-blue-400">بررسی...</span>
                      </div>
                    ) : status.ok ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-400 font-medium">متصل</span>
                        </div>
                        <p className="text-xs text-muted-foreground">تأخیر: {status.latency}ms</p>
                        {status.blockNumber && (
                          <p className="text-xs text-muted-foreground">بلاک: #{parseInt(status.blockNumber).toLocaleString('en')}</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-xs text-red-400">قطع شده</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ماژول‌های On-Chain */}
        <div className="glass-card">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              ماژول‌های On-Chain Intelligence
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y divide-border/20">
            {ONCHAIN_MODULES.map((mod) => (
              <div key={mod.title} className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-muted-foreground">{mod.title}</p>
                    <DataQualityBadge status={mod.status as any} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{mod.need}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* قانون OnChain */}
        <div className="glass-card p-5 border-primary/20">
          <h3 className="font-semibold text-primary mb-3">قانون داده OnChain</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong className="text-foreground">داده وجود دارد:</strong> از منبع معتبر با Timestamp نمایش داده می‌شود.</p>
            <p>• <strong className="text-foreground">داده وجود ندارد:</strong> «داده در دسترس نیست» نمایش داده می‌شود.</p>
            <p>• <strong className="text-foreground">منبع قطع است:</strong> «منبع داده پاسخ نمی‌دهد» نمایش داده می‌شود.</p>
            <p>• <strong className="text-foreground">هرگز:</strong> داده ساختگی یا Math.random() تولید نمی‌شود.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
