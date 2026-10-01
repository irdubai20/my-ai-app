// =========================================
// API Layer سازمانی — دریافت داده واقعی
// بدون API Key — منابع عمومی
// =========================================
import type { MarketData } from '@/types';
import type { CandleData, DerivativesData, NewsItem, StablecoinMetrics } from '@/types/intelligence';
import type { OHLCV } from './indicators';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES = 'https://fapi.binance.com/fapi/v1';

// =====================
// Market Data Cache
// =====================
let _marketCache: MarketData[] = [];
let _lastMarketFetch = 0;
const MARKET_CACHE_TTL = 60_000;

export async function fetchTopCoins(limit = 30): Promise<{ data: MarketData[]; source: 'live' | 'cache' | 'unavailable' }> {
  const now = Date.now();
  if (_marketCache.length > 0 && now - _lastMarketFetch < MARKET_CACHE_TTL) {
    return { data: _marketCache, source: 'cache' };
  }
  try {
    const resp = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) {
      if (resp.status === 429) return { data: _marketCache.length > 0 ? _marketCache : [], source: _marketCache.length > 0 ? 'cache' : 'unavailable' };
      throw new Error(`HTTP ${resp.status}`);
    }
    const raw = await resp.json() as any[];
    const data: MarketData[] = raw.map(coin => ({
      symbol: (coin.symbol as string).toUpperCase(),
      name: coin.name,
      price: coin.current_price ?? 0,
      change24h: coin.price_change_percentage_24h ?? 0,
      change7d: coin.price_change_percentage_7d_in_currency ?? 0,
      volume24h: coin.total_volume ?? 0,
      marketCap: coin.market_cap ?? 0,
      rank: coin.market_cap_rank ?? 0,
      image: coin.image,
    }));
    _marketCache = data;
    _lastMarketFetch = now;
    return { data, source: 'live' };
  } catch (err) {
    console.log('[MarketAPI] خطا:', err);
    return { data: _marketCache.length > 0 ? _marketCache : [], source: _marketCache.length > 0 ? 'cache' : 'unavailable' };
  }
}

// =====================
// CoinGecko Market Chart (کندل‌های 1 روزه)
// =====================
let _candleCache: Record<string, { data: OHLCV[]; ts: number }> = {};
const CANDLE_CACHE_TTL = 5 * 60_000;

export async function fetchCoinGeckoCandles(coinId: string, days = 30): Promise<{ data: OHLCV[]; source: 'live' | 'cache' | 'unavailable' }> {
  const key = `${coinId}_${days}`;
  const now = Date.now();
  if (_candleCache[key] && now - _candleCache[key].ts < CANDLE_CACHE_TTL) {
    return { data: _candleCache[key].data, source: 'cache' };
  }
  try {
    const resp = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const raw = await resp.json() as [number, number, number, number, number][];
    // CoinGecko returns [timestamp, open, high, low, close]
    const data: OHLCV[] = raw.map(([, o, h, l, c]) => ({
      open: o, high: h, low: l, close: c
    })).filter(c => c.high >= c.low && c.close >= c.low && c.close <= c.high);
    _candleCache[key] = { data, ts: now };
    return { data, source: 'live' };
  } catch (err) {
    console.log('[CandleAPI] خطا:', err);
    return { data: _candleCache[key]?.data ?? [], source: _candleCache[key]?.data?.length ? 'cache' : 'unavailable' };
  }
}

// =====================
// Binance Klines (کندل‌های 1h - PUBLIC)
// =====================
let _binanceCandleCache: Record<string, { data: OHLCV[]; ts: number }> = {};
const BINANCE_CACHE_TTL = 2 * 60_000;

export async function fetchBinanceCandles(symbol: string, interval = '1h', limit = 200): Promise<{ data: OHLCV[]; source: 'live' | 'cache' | 'unavailable' }> {
  const key = `${symbol}_${interval}_${limit}`;
  const now = Date.now();
  if (_binanceCandleCache[key] && now - _binanceCandleCache[key].ts < BINANCE_CACHE_TTL) {
    return { data: _binanceCandleCache[key].data, source: 'cache' };
  }
  try {
    const resp = await fetch(
      `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const raw = await resp.json() as any[][];
    const data: OHLCV[] = raw.map(k => ({
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    })).filter(c => c.high >= c.low && c.close >= c.low && c.close <= c.high);
    _binanceCandleCache[key] = { data, ts: now };
    return { data, source: 'live' };
  } catch (err) {
    console.log('[BinanceKlines] خطا:', err);
    return { data: _binanceCandleCache[key]?.data ?? [], source: _binanceCandleCache[key]?.data?.length ? 'cache' : 'unavailable' };
  }
}

// =====================
// Binance Ticker 24h (PUBLIC)
// =====================
let _binanceTickerCache: Record<string, { data: any; ts: number }> = {};
const TICKER_CACHE_TTL = 30_000;

export async function fetchBinanceTicker(symbol: string): Promise<{ data: any | null; source: 'live' | 'cache' | 'unavailable' }> {
  const now = Date.now();
  if (_binanceTickerCache[symbol] && now - _binanceTickerCache[symbol].ts < TICKER_CACHE_TTL) {
    return { data: _binanceTickerCache[symbol].data, source: 'cache' };
  }
  try {
    const resp = await fetch(
      `${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _binanceTickerCache[symbol] = { data, ts: now };
    return { data, source: 'live' };
  } catch (err) {
    console.log('[BinanceTicker] خطا:', err);
    return { data: _binanceTickerCache[symbol]?.data ?? null, source: _binanceTickerCache[symbol]?.data ? 'cache' : 'unavailable' };
  }
}

// =====================
// Binance Futures Funding Rate (PUBLIC)
// =====================
let _fundingCache: Record<string, { data: any; ts: number }> = {};
const FUNDING_CACHE_TTL = 60_000;

export async function fetchFundingRate(symbol: string): Promise<{ rate: number | null; source: 'live' | 'cache' | 'unavailable' }> {
  const now = Date.now();
  if (_fundingCache[symbol] && now - _fundingCache[symbol].ts < FUNDING_CACHE_TTL) {
    const cached = _fundingCache[symbol].data;
    return { rate: parseFloat(cached.lastFundingRate ?? 0), source: 'cache' };
  }
  try {
    const resp = await fetch(
      `${BINANCE_FUTURES}/premiumIndex?symbol=${symbol}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _fundingCache[symbol] = { data, ts: now };
    return { rate: parseFloat(data.lastFundingRate ?? '0'), source: 'live' };
  } catch (err) {
    console.log('[FundingRate] خطا:', err);
    return { rate: null, source: 'unavailable' };
  }
}

// =====================
// Binance Futures Open Interest (PUBLIC)
// =====================
let _oiCache: Record<string, { data: any; ts: number }> = {};
const OI_CACHE_TTL = 60_000;

export async function fetchOpenInterest(symbol: string): Promise<{ value: number | null; source: 'live' | 'cache' | 'unavailable' }> {
  const now = Date.now();
  if (_oiCache[symbol] && now - _oiCache[symbol].ts < OI_CACHE_TTL) {
    return { value: parseFloat(_oiCache[symbol].data.openInterest ?? '0'), source: 'cache' };
  }
  try {
    const resp = await fetch(
      `${BINANCE_FUTURES}/openInterest?symbol=${symbol}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _oiCache[symbol] = { data, ts: now };
    return { value: parseFloat(data.openInterest ?? '0'), source: 'live' };
  } catch (err) {
    console.log('[OpenInterest] خطا:', err);
    return { value: null, source: 'unavailable' };
  }
}

// =====================
// CoinGecko Global Market
// =====================
let _globalCache: any = null;
let _lastGlobalFetch = 0;
const GLOBAL_CACHE_TTL = 5 * 60_000;

export async function fetchGlobalMarket(): Promise<{ data: any | null; source: 'live' | 'cache' | 'unavailable' }> {
  const now = Date.now();
  if (_globalCache && now - _lastGlobalFetch < GLOBAL_CACHE_TTL) {
    return { data: _globalCache, source: 'cache' };
  }
  try {
    const resp = await fetch(`${COINGECKO_BASE}/global`, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const res = await resp.json();
    _globalCache = res.data;
    _lastGlobalFetch = now;
    return { data: res.data, source: 'live' };
  } catch (err) {
    console.log('[GlobalMarket] خطا:', err);
    return { data: _globalCache, source: _globalCache ? 'cache' : 'unavailable' };
  }
}

// =====================
// News RSS (public — CoinTelegraph)
// =====================
let _newsCache: NewsItem[] = [];
let _lastNewsFetch = 0;
const NEWS_CACHE_TTL = 15 * 60_000;

export async function fetchCryptoNews(): Promise<{ data: NewsItem[]; source: 'live' | 'cache' | 'unavailable' }> {
  const now = Date.now();
  if (_newsCache.length > 0 && now - _lastNewsFetch < NEWS_CACHE_TTL) {
    return { data: _newsCache, source: 'cache' };
  }
  try {
    // استفاده از RSS2JSON برای دریافت خبر بدون CORS
    const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss';
    const resp = await fetch(rssUrl, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.items) throw new Error('no items');
    const news: NewsItem[] = (data.items as any[]).slice(0, 20).map((item: any, idx: number) => ({
      id: `news_${idx}_${Date.now()}`,
      title: item.title,
      source: 'CoinTelegraph',
      sourceUrl: item.link,
      publishedAt: new Date(item.pubDate),
      category: 'بازار',
      status: 'VALID' as const,
    }));
    _newsCache = news;
    _lastNewsFetch = now;
    return { data: news, source: 'live' };
  } catch (err) {
    console.log('[News] خطا:', err);
    return { data: _newsCache, source: _newsCache.length > 0 ? 'cache' : 'unavailable' };
  }
}

// =====================
// RPC Health Check
// =====================
export async function checkRpcHealth(url: string): Promise<{ ok: boolean; latency: number; blockNumber?: string }> {
  const start = Date.now();
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (resp.ok) {
      const data = await resp.json();
      if (data?.result) {
        const blockNum = parseInt(data.result, 16).toString();
        return { ok: true, latency, blockNumber: blockNum };
      }
    }
    return { ok: false, latency };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}

// =====================
// Binance Futures Long/Short Ratio (PUBLIC)
// =====================
let _lsCache: Record<string, { data: any; ts: number }> = {};
const LS_CACHE_TTL = 5 * 60_000;

export async function fetchLongShortRatio(symbol: string, period = '1h'): Promise<{ ratio: number | null; longPct: number | null; shortPct: number | null; source: 'live' | 'cache' | 'unavailable' }> {
  const key = `${symbol}_${period}`;
  const now = Date.now();
  if (_lsCache[key] && now - _lsCache[key].ts < LS_CACHE_TTL) {
    const d = _lsCache[key].data;
    return { ratio: parseFloat(d.longShortRatio), longPct: parseFloat(d.longAccount), shortPct: parseFloat(d.shortAccount), source: 'cache' };
  }
  try {
    const resp = await fetch(
      `https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=1`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const arr = await resp.json();
    if (!arr?.[0]) throw new Error('empty');
    const d = arr[0];
    _lsCache[key] = { data: d, ts: now };
    return { ratio: parseFloat(d.longShortRatio), longPct: parseFloat(d.longAccount) * 100, shortPct: parseFloat(d.shortAccount) * 100, source: 'live' };
  } catch (err) {
    console.log('[LongShort] خطا:', err);
    return { ratio: null, longPct: null, shortPct: null, source: 'unavailable' };
  }
}

// =====================
// CoinGecko по ID
// =====================
export async function fetchCoinById(coinId: string): Promise<{ price: number; change24h: number } | null> {
  try {
    const resp = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const entry = data[coinId];
    if (!entry) return null;
    return { price: entry.usd, change24h: entry.usd_24h_change ?? 0 };
  } catch {
    return null;
  }
}
