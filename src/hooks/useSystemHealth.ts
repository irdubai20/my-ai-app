// ===================================
// هوک سلامت سیستم
// ===================================
import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { checkRpcHealth } from '@/lib/api';

export function useSystemHealth() {
  const { setHealth, settings } = useAppStore();

  useEffect(() => {
    const checkAll = async () => {
      const bscRes = await checkRpcHealth(settings.rpc.bsc || 'https://bsc-dataseed.binance.org/');
      const ethRes = await checkRpcHealth(settings.rpc.eth || 'https://cloudflare-eth.com');
      const baseRes = await checkRpcHealth(settings.rpc.base || 'https://mainnet.base.org');

      // CoinGecko
      let apiStatus: 'متصل' | 'قطع شده' | 'محدود شده' | 'در حال بررسی' | 'خطا' | 'پیکربندی نشده' = 'قطع شده';
      let apiLatency: number | undefined;
      try {
        const start = Date.now();
        const r = await fetch('https://api.coingecko.com/api/v3/ping', { signal: AbortSignal.timeout(5000) });
        apiLatency = Date.now() - start;
        if (r.ok) apiStatus = 'متصل';
        else if (r.status === 429) apiStatus = 'محدود شده';
      } catch { apiStatus = 'قطع شده'; }

      setHealth({
        api: { status: apiStatus, latency: apiLatency },
        rpc_bsc: { status: bscRes.ok ? 'متصل' : 'قطع شده', latency: bscRes.latency, message: bscRes.blockNumber ? `Block: ${bscRes.blockNumber}` : undefined },
        rpc_eth: { status: ethRes.ok ? 'متصل' : 'قطع شده', latency: ethRes.latency },
        rpc_base: { status: baseRes.ok ? 'متصل' : 'قطع شده', latency: baseRes.latency },
        storage: { status: 'متصل', message: 'localStorage' },
      });
    };

    checkAll();
  }, []);
}
