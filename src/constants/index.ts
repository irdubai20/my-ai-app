import type { AppSettings } from '@/types';

export const NETWORKS = {
  BSC: {
    name: 'BNB Chain',
    symbol: 'BNB',
    color: '#F3BA2F',
    rpc: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com',
    chainId: 56,
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    rpc: 'https://cloudflare-eth.com',
    explorer: 'https://etherscan.io',
    chainId: 1,
  },
  BASE: {
    name: 'Base',
    symbol: 'ETH',
    color: '#0052FF',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    chainId: 8453,
  },
};

export const RISK_COLORS = {
  'مناسب': 'text-green-400',
  'متوسط': 'text-yellow-400',
  'ضعیف': 'text-orange-400',
  'مشکوک': 'text-red-400',
};

export const RISK_BG = {
  'مناسب': 'bg-green-500/10 border-green-500/20 text-green-400',
  'متوسط': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  'ضعیف': 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  'مشکوک': 'bg-red-500/10 border-red-500/20 text-red-400',
};

export const CONNECTION_STATUS_COLORS = {
  'متصل': 'text-green-400',
  'قطع شده': 'text-red-400',
  'محدود شده': 'text-yellow-400',
  'در حال بررسی': 'text-blue-400',
  'خطا': 'text-red-400',
  'پیکربندی نشده': 'text-muted-foreground',
};

export const CONNECTION_STATUS_BG = {
  'متصل': 'bg-green-500/10 border-green-500/20 text-green-400',
  'قطع شده': 'bg-red-500/10 border-red-500/20 text-red-400',
  'محدود شده': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  'در حال بررسی': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  'خطا': 'bg-red-500/10 border-red-500/20 text-red-400',
  'پیکربندی نشده': 'bg-muted border-border text-muted-foreground',
};

export const DEFAULT_SETTINGS: AppSettings = {
  telegram: {
    botToken: '',
    chatId: '',
    enabled: false,
    sendSignals: true,
    sendAlerts: true,
    sendHealth: false,
  },
  scanner: {
    autoScan: false,
    intervalMinutes: 30,
    networks: ['BSC', 'ETH', 'BASE'],
    minLiquidity: 50000,
    minSmartWallets: 3,
    riskFilter: ['مناسب', 'متوسط'],
  },
  rpc: {
    bsc: 'https://bsc-dataseed.binance.org/',
    eth: 'https://cloudflare-eth.com',
    base: 'https://mainnet.base.org',
  },
  notifications: {
    browser: false,
    sound: false,
  },
};

export const MASTER_PROMPT_DEFAULT = `# سیستم نهنگ‌یاب هوشمند ارزهای دیجیتال

## مأموریت اصلی
کشف و تحلیل کیف پول‌های هوشمند (Smart Money) در بازار ارزهای دیجیتال با هدف شناسایی فرصت‌های معاملاتی با کیفیت بالا.

## اصول تحلیل

### کیف پول هوشمند
- نرخ برد بیش از ۶۵٪
- حجم معاملات بالای ۱۰۰,۰۰۰ دلار
- سابقه فعالیت حداقل ۳ ماه
- معاملات متنوع در چندین توکن
- ورود زودهنگام به پروژه‌های موفق

### معیارهای صدور سیگنال
۱. حضور حداقل ۳ کیف پول هوشمند
۲. نقدینگی کافی (حداقل ۵۰,۰۰۰ دلار)
۳. داده قیمت معتبر و به‌روز
۴. ریسک قابل قبول
۵. روند بازار مثبت یا خنثی

### مدیریت ریسک
- هرگز بیش از ۲٪ سرمایه در یک معامله
- حد ضرر اجباری برای تمام سیگنال‌ها
- نسبت سود به زیان حداقل ۲:۱

## هشدار مهم
این سیستم صرفاً ابزار تحلیل است و هیچ‌گونه تضمین سود یا پیش‌بینی قطعی ارائه نمی‌دهد.
تصمیم‌گیری نهایی برعهده کاربر است.
`;

export const TOP_COINS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple',
  'cardano', 'avalanche-2', 'polkadot', 'chainlink', 'matic-network',
  'uniswap', 'aave', 'compound-governance-token', 'pancakeswap-token', 'the-sandbox'
];
