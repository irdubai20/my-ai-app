// =============================
// انواع داده Intelligence سازمانی
// =============================

// وضعیت کیفیت داده
export type DataQualityStatus =
  | 'VALID'
  | 'STALE'
  | 'INVALID'
  | 'MISSING'
  | 'DUPLICATE'
  | 'INCOMPLETE'
  | 'CONFLICTED'
  | 'UNAVAILABLE'
  | 'UNVERIFIED'
  | 'NOT_SUPPORTED'
  | 'NOT_CONNECTED'
  | 'INSUFFICIENT_DATA';

// وضعیت Provider
export type ProviderStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';

// وضعیت بازار
export type MarketRegime =
  | 'TRENDING_UP'
  | 'TRENDING_DOWN'
  | 'RANGING'
  | 'HIGH_VOLATILITY'
  | 'LOW_VOLATILITY'
  | 'BREAKOUT'
  | 'BREAKDOWN'
  | 'LIQUIDITY_STRESS'
  | 'TRANSITION'
  | 'UNKNOWN';

// جهت Forecast
export type ForecastDirection = 'UP' | 'DOWN' | 'NEUTRAL' | 'UNKNOWN';

// نوع سیگنال
export type SignalDirection = 'BUY' | 'SELL' | 'NO_ENTRY';

// وضعیت Forecast
export type ForecastStatus =
  | 'CREATED'
  | 'VALIDATING'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'INVALIDATED'
  | 'STALE';

// نوع Horizon
export type ForecastHorizon = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D';

// Trend
export type TrendDirection = 'صعودی' | 'نزولی' | 'خنثی' | 'نامشخص';
export type TrendStrength = 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG' | 'UNKNOWN';

// Market Consensus
export type MarketConsensus =
  | 'STRONG_BULLISH'
  | 'BULLISH'
  | 'NEUTRAL'
  | 'BEARISH'
  | 'STRONG_BEARISH'
  | 'CONFLICTED'
  | 'UNKNOWN';

// --- Indicators ---
export interface TechnicalIndicators {
  ema20?: number;
  ema50?: number;
  ema100?: number;
  ema200?: number;
  sma20?: number;
  sma50?: number;
  rsi14?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  atr14?: number;
  adx14?: number;
  bollingerUpper?: number;
  bollingerMiddle?: number;
  bollingerLower?: number;
  bollingerWidth?: number;
  vwap?: number;
  stochastic?: number;
  cci?: number;
  roc?: number;
  momentum?: number;
  quality: DataQualityStatus;
  calculatedAt: Date;
}

// --- Market Structure ---
export interface MarketStructure {
  state: 'UPTREND' | 'DOWNTREND' | 'RANGE' | 'TRANSITION' | 'UNKNOWN';
  higherHigh: boolean;
  higherLow: boolean;
  lowerHigh: boolean;
  lowerLow: boolean;
  trend: TrendDirection;
  trendStrength: TrendStrength;
  support1?: number;
  support2?: number;
  support3?: number;
  resistance1?: number;
  resistance2?: number;
  resistance3?: number;
  quality: DataQualityStatus;
}

// --- Smart Money ---
export interface SmartMoneyEvent {
  id: string;
  type: 'BOS' | 'CHoCH' | 'FVG' | 'ORDER_BLOCK' | 'LIQUIDITY_SWEEP' | 'DISPLACEMENT' | 'MITIGATION';
  price: number;
  confidence: number;
  timeframe: string;
  detectedAt: Date;
  description: string;
  quality: DataQualityStatus;
}

// --- Derivatives ---
export interface DerivativesData {
  symbol: string;
  fundingRate?: number;
  fundingRateTrend?: 'صعودی' | 'نزولی' | 'خنثی';
  openInterest?: number;
  openInterestChange24h?: number;
  longShortRatio?: number;
  longLiquidations24h?: number;
  shortLiquidations24h?: number;
  basis?: number;
  markPrice?: number;
  indexPrice?: number;
  status: DataQualityStatus;
  source?: string;
  updatedAt?: Date;
}

// --- OnChain ---
export interface OnChainMetrics {
  network: string;
  activeAddresses?: number;
  transactionCount?: number;
  transactionVolume?: number;
  exchangeInflow?: number;
  exchangeOutflow?: number;
  netflow?: number;
  whaleTransfers?: number;
  stablecoinFlow?: number;
  status: DataQualityStatus;
  provider?: string;
  updatedAt?: Date;
}

// --- Forecast ---
export interface ForecastResult {
  id: string;
  symbol: string;
  horizon: ForecastHorizon;
  createdAt: Date;
  expiresAt: Date;
  currentPrice: number;
  predictedPrice?: number;
  lowerBound?: number;
  upperBound?: number;
  direction: ForecastDirection;
  confidence: number;
  modelName: string;
  modelVersion: string;
  engineVersion: string;
  marketRegime: MarketRegime;
  dataQuality: DataQualityStatus;
  status: ForecastStatus;
  reasons: string[];
  risks: string[];
  // verification
  actualPrice?: number;
  forecastError?: number;
  absoluteError?: number;
  percentageError?: number;
  directionCorrect?: boolean;
  verifiedAt?: Date;
}

// --- Signal ---
export interface EnterpriseSignal {
  id: string;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'INVALIDATED' | 'CLOSED';
  forecastId?: string;
  entry?: number;
  stopLoss?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  tp4?: number;
  tp5?: number;
  riskReward?: number;
  riskStatus: 'VALID' | 'INVALID' | 'NOT_ELIGIBLE' | 'UNKNOWN';
  reasonCodes: string[];
  reasoning: string[];
  dataQuality: DataQualityStatus;
  eligibilityGate: EligibilityGateResult;
}

// --- Eligibility Gate ---
export interface EligibilityGateResult {
  passed: boolean;
  checks: {
    dataQuality: boolean;
    trendConfirmed: boolean;
    momentumConfirmed: boolean;
    structureConfirmed: boolean;
    riskValid: boolean;
    forecastAgreement: boolean;
    noConflict: boolean;
    liquidityOk: boolean;
  };
  failReasons: string[];
}

// --- Provider ---
export interface MarketProvider {
  name: string;
  type: 'MARKET_DATA' | 'NEWS' | 'ONCHAIN' | 'CALENDAR' | 'DERIVATIVES';
  priority: number;
  status: ProviderStatus;
  latencyMs?: number;
  lastSuccessAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
  reliabilityScore?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
  availabilityPercent?: number;
  successCount: number;
  failureCount: number;
}

// --- Performance Metrics ---
export interface ForecastPerformanceMetrics {
  symbol: string;
  timeframe: ForecastHorizon;
  totalForecasts: number;
  mae?: number;
  mape?: number;
  rmse?: number;
  directionAccuracy?: number;
  winningForecasts: number;
  losingForecasts: number;
  regime: MarketRegime;
  period: string;
  status: DataQualityStatus;
}

// --- Candle ---
export interface CandleData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  source: string;
  quality: DataQualityStatus;
}

// --- Multi-timeframe ---
export interface TimeframeAnalysis {
  timeframe: ForecastHorizon;
  trend: TrendDirection;
  momentum: 'مثبت' | 'منفی' | 'خنثی' | 'نامشخص';
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'UNKNOWN';
  rsi?: number;
  macd?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  emaStack?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weight: number;
  quality: DataQualityStatus;
}

// --- Capital Flow ---
export interface CapitalFlowData {
  asset: string;
  exchangeInflow: number;
  exchangeOutflow: number;
  netflow: number;
  stablecoinFlow: number;
  whaleAccumulation: number;
  whaleDistribution: number;
  smartMoneyFlow: string;
  status: DataQualityStatus;
  updatedAt?: Date;
}

// --- Liquidity ---
export interface LiquidityData {
  symbol: string;
  bidDepth?: number;
  askDepth?: number;
  spread?: number;
  midPrice?: number;
  imbalance?: number;
  depthAt1Pct?: number;
  priceImpact1M?: number;
  liquidationLong?: number;
  liquidationShort?: number;
  status: DataQualityStatus;
  updatedAt?: Date;
}

// --- News ---
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  category: string;
  sentiment?: 'مثبت' | 'منفی' | 'خنثی';
  sentimentScore?: number;
  relevantAssets?: string[];
  status: DataQualityStatus;
}

// --- Stablecoin ---
export interface StablecoinMetrics {
  symbol: string;
  supply?: number;
  supplyChange24h?: number;
  exchangeFlow?: number;
  chainDistribution?: Record<string, number>;
  depegRisk: 'NORMAL' | 'WATCH' | 'ELEVATED' | 'SEVERE' | 'DATA_UNAVAILABLE';
  price?: number;
  status: DataQualityStatus;
}
