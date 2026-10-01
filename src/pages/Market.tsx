// =========================================
// صفحه بازار — جدول کامل ارزها
// =========================================
import { useState, useEffect } from 'react';
import { BarChart2, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SourceBadge, DataQualityBadge } from '@/components/features/StatusBadge';
import { useAppStore } from '@/stores/appStore';
import { fetchTopCoins } from '@/lib/api';
import { formatPrice, formatNumber, formatPercent, getChangeColor, cn } from '@/lib/utils';

export default function Market() {
  const { marketData, marketDataSource, setMarketData } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'change24h' | 'volume24h'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const loadData = async () => {
    setLoading(true);
    const result = await fetchTopCoins(100);
    setMarketData(result.data, result.source);
    setLoading(false);
  };

  useEffect(() => { if (marketData.length === 0) loadData(); }, []);

  const filtered = marketData
    .filter(c => !search || c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av = sortBy === 'rank' ? a.rank : sortBy === 'change24h' ? a.change24h : a.volume24h;
      let bv = sortBy === 'rank' ? b.rank : sortBy === 'change24h' ? b.change24h : b.volume24h;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  return (
    <div className="min-h-full">
      <Header title="بازار" subtitle="قیمت‌های زنده — CoinGecko" onRefresh={loadData} isRefreshing={loading} />

      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SourceBadge source={marketDataSource} />
          <DataQualityBadge status={marketData.length > 0 ? 'VALID' : 'UNAVAILABLE'} />
          <span className="text-xs text-muted-foreground">{marketData.length} ارز</span>
        </div>

        {/* جستجو */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی ارز..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {loading && marketData.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">دریافت داده بازار...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">داده‌ای پیدا نشد.</p>
          </div>
        ) : (
          <div className="glass-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/30">
                  <th className="text-right py-3 px-4 cursor-pointer hover:text-foreground" onClick={() => toggleSort('rank')}># {sortBy === 'rank' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="text-right py-3 px-4">ارز</th>
                  <th className="text-right py-3 px-4">قیمت</th>
                  <th className="text-right py-3 px-4 cursor-pointer hover:text-foreground" onClick={() => toggleSort('change24h')}>۲۴h {sortBy === 'change24h' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="text-right py-3 px-4 hidden md:table-cell">۷ روز</th>
                  <th className="text-right py-3 px-4 cursor-pointer hover:text-foreground hidden md:table-cell" onClick={() => toggleSort('volume24h')}>حجم {sortBy === 'volume24h' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="text-right py-3 px-4 hidden lg:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map(coin => (
                  <tr key={coin.symbol} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 text-xs text-muted-foreground number-display">{coin.rank}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {coin.image && <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full" />}
                        <div>
                          <p className="text-sm font-semibold">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{coin.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm number-display">{formatPrice(coin.price)}</td>
                    <td className={cn('py-3 px-4 text-sm font-medium number-display', getChangeColor(coin.change24h))}>{formatPercent(coin.change24h)}</td>
                    <td className={cn('py-3 px-4 text-sm number-display hidden md:table-cell', getChangeColor(coin.change7d))}>{formatPercent(coin.change7d)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground number-display hidden md:table-cell">${formatNumber(coin.volume24h)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground number-display hidden lg:table-cell">${formatNumber(coin.marketCap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
