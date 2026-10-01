// =============================
// انواع داده سامانه نهنگ‌یاب
// =============================

export type NetworkType = 'BSC' | 'ETH' | 'BASE';

export type RiskLevel = 'مناسب' | 'متوسط' | 'ضعیف' | 'مشکوک';

export type SignalType = 'خرید' | 'فروش' | 'نگهداری';

export type ScanStatus = 'در حال اجرا' | 'متوقف' | 'مکث' | 'خطا' | 'آماده';

export type ConnectionStatus = 'متصل' | 'قطع شده' | 'محدود شده' | 'در حال بررسی' | 'خطا' | 'پیکربندی نشده';

export type ImplementationStatus = 'پیاده‌سازی نشده' | 'ناقص' | 'متصل نیست' | 'در دسترس نیست' | 'شکست خورده' | 'پیکربندی نشده' | 'فعال';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  network: NetworkType;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  riskLevel: RiskLevel;
  discoveredAt: Date;
  lastUpdated: Date;
  smartMoneyCount: number;
  signals: Signal[];
}

export interface Wallet {
  id: string;
  address: string;
  network: NetworkType;
  label?: string;
  totalTransactions: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  buyVolume: number;
  sellVolume: number;
  avgEntryPrice?: number;
  currentValue: number;
  smartScore: number;
  riskLevel: RiskLevel;
  lastActive: Date;
  clusterGroup?: string;
  recentTxs: Transaction[];
  topTokens: string[];
}

export interface Transaction {
  hash: string;
  walletAddress: string;
  network: NetworkType;
  type: 'خرید' | 'فروش' | 'انتقال';
  token: string;
  amount: number;
  value: number;
  timestamp: Date;
  confirmed: boolean;
}

export interface Signal {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  network: NetworkType;
  type: SignalType;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  riskReward: number;
  confidence: number;
  reasons: string[];
  smartMoneyWallets: number;
  riskLevel: RiskLevel;
  createdAt: Date;
  status: 'فعال' | 'بسته شده' | 'انقضا یافته';
  marketTrend: string;
  trendStrength: number;
  momentum: number;
  liquidityScore: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  image?: string;
}

export interface ScanRun {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  status: ScanStatus;
  tokensDiscovered: number;
  walletsAnalyzed: number;
  signalsGenerated: number;
  networks: NetworkType[];
  errors: string[];
}

export interface SystemHealth {
  api: { status: ConnectionStatus; latency?: number; message?: string };
  database: { status: ConnectionStatus; message?: string };
  redis: { status: ConnectionStatus; message?: string };
  queue: { status: ConnectionStatus; message?: string };
  rpc_bsc: { status: ConnectionStatus; latency?: number; message?: string };
  rpc_eth: { status: ConnectionStatus; latency?: number; message?: string };
  rpc_base: { status: ConnectionStatus; latency?: number; message?: string };
  telegram: { status: ConnectionStatus; message?: string };
  storage: { status: ConnectionStatus; message?: string };
}

export interface AppSettings {
  telegram: {
    botToken: string;
    chatId: string;
    enabled: boolean;
    sendSignals: boolean;
    sendAlerts: boolean;
    sendHealth: boolean;
  };
  scanner: {
    autoScan: boolean;
    intervalMinutes: number;
    networks: NetworkType[];
    minLiquidity: number;
    minSmartWallets: number;
    riskFilter: RiskLevel[];
  };
  rpc: {
    bsc: string;
    eth: string;
    base: string;
  };
  notifications: {
    browser: boolean;
    sound: boolean;
  };
}

export interface PromptVersion {
  id: string;
  version: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  description: string;
}

export interface SourceBuild {
  version: string;
  builtAt?: Date;
  size?: string;
  status: 'آماده دانلود' | 'در حال ساخت' | 'خطا' | 'پیکربندی نشده';
  files: string[];
}

export interface Alert {
  id: string;
  type: 'سیگنال' | 'هشدار' | 'خطا' | 'سلامت' | 'اطلاعات';
  title: string;
  message: string;
  network?: NetworkType;
  token?: string;
  createdAt: Date;
  read: boolean;
  sent_telegram: boolean;
}
