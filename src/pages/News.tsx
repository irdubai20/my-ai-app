// =========================================
// صفحه اخبار — RSS Feed عمومی
// =========================================
import { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { DataQualityBadge, SourceBadge } from '@/components/features/StatusBadge';
import { fetchCryptoNews } from '@/lib/api';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { NewsItem } from '@/types/intelligence';

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [source, setSource] = useState<'live' | 'cache' | 'unavailable'>('unavailable');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    const res = await fetchCryptoNews();
    setNews(res.data);
    setSource(res.source);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { loadNews(); }, [loadNews]);

  return (
    <div className="min-h-full">
      <Header
        title="اخبار بازار"
        subtitle="اخبار ارزهای دیجیتال — CoinTelegraph RSS"
        onRefresh={loadNews}
        isRefreshing={loading}
      />

      <div className="p-4 lg:p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <SourceBadge source={source} />
          <DataQualityBadge status={news.length > 0 ? 'VALID' : 'UNAVAILABLE'} />
          {lastUpdate && <span className="text-xs text-muted-foreground">آپدیت: {lastUpdate.toLocaleTimeString('fa-IR')}</span>}
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300/90">
            اخبار از RSS فید عمومی CoinTelegraph دریافت می‌شود. تحلیل Sentiment خودکار (NLP) نیاز به Backend دارد و در این نسخه پشتیبانی نمی‌شود.
          </p>
        </div>

        {loading && news.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">دریافت اخبار...</p>
          </div>
        ) : source === 'unavailable' && news.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-1">منبع خبر پاسخ نمی‌دهد</p>
            <p className="text-xs text-muted-foreground/70">ممکن است RSS Feed محدود شده باشد.</p>
            <button onClick={loadNews} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">تلاش مجدد</button>
          </div>
        ) : (
          <div className="glass-card divide-y divide-border/20">
            {news.map(item => (
              <div key={item.id} className="p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug flex-1">{item.title}</p>
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1 rounded text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(item.publishedAt)}</span>
                      <DataQualityBadge status="VALID" />
                      <span className="text-xs badge-muted">Sentiment: <DataQualityBadge status="NOT_SUPPORTED" /></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Economic Calendar */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-muted-foreground">تقویم اقتصادی</h3>
            <DataQualityBadge status="NOT_CONNECTED" />
          </div>
          <p className="text-sm text-muted-foreground">رویدادهای اقتصادی (CPI، FOMC، NFP) نیاز به Calendar Provider اختصاصی دارند.</p>
        </div>
      </div>
    </div>
  );
}
