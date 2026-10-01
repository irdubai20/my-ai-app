// ===================================
// هوک بارگذاری داده‌های بازار
// ===================================
import { useEffect, useRef } from 'react';
import { fetchTopCoins } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';

export function useMarketData(autoRefresh = true, intervalMs = 60000) {
  const { setMarketData, marketData, lastMarketUpdate } = useAppStore();
  const timerRef = useRef<number | null>(null);

  const load = async () => {
    const result = await fetchTopCoins(30);
    setMarketData(result.data, result.source);
    console.log('[MarketData] منبع:', result.source, 'تعداد:', result.data.length);
  };

  useEffect(() => {
    load();
    if (autoRefresh) {
      timerRef.current = window.setInterval(load, intervalMs);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return { marketData, lastMarketUpdate };
}
