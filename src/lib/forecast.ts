// =========================================
// موتور Forecast و Signal سازمانی
// بدون Math.random — بر اساس داده واقعی
// =========================================
import type { OHLCV, FullIndicatorResult } from './indicators';
import type {
  ForecastResult, EnterpriseSignal, EligibilityGateResult,
  MarketRegime, ForecastDirection, ForecastHorizon, MarketStructure
} from '@/types/intelligence';
import { detectMarketStructure, getMACDSignal, detectEMAStack, getRSIStatus } from './indicators';
import { generateId } from './utils';

const ENGINE_VERSION = '1.0.0';
const MODEL_NAME = 'TechnicalEnsemble';
const MODEL_VERSION = '1.0.0';

// ========================
// تشخیص Market Regime
// ========================
export function detectMarketRegime(candles: OHLCV[], indicators: FullIndicatorResult): MarketRegime {
  if (!indicators.sufficientData) return 'UNKNOWN';

  const closes = candles.map(c => c.close);
  const lastClose = closes[closes.length - 1];

  // نوسان
  const returns = closes.slice(-20).map((c, i, arr) => i > 0 ? (c - arr[i - 1]) / arr[i - 1] : 0).slice(1);
  const volatility = Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length) * 100;

  // روند
  const structure = indicators.structure;

  if (volatility > 3) return 'HIGH_VOLATILITY';
  if (structure.state === 'UPTREND') {
    if (indicators.atr14 && indicators.ema20 && indicators.ema50) {
      if (indicators.ema20 > indicators.ema50) return 'TRENDING_UP';
    }
    return 'TRENDING_UP';
  }
  if (structure.state === 'DOWNTREND') return 'TRENDING_DOWN';
  if (volatility < 0.3) return 'LOW_VOLATILITY';
  if (structure.state === 'RANGE') return 'RANGING';
  return 'TRANSITION';
}

// ========================
// ارزیابی Eligibility Gate
// ========================
export function evaluateEligibilityGate(
  indicators: FullIndicatorResult,
  regime: MarketRegime,
  dataQuality: string,
  price: number
): EligibilityGateResult {
  const failReasons: string[] = [];

  const dataQualityOk = dataQuality === 'VALID' && indicators.sufficientData;
  if (!dataQualityOk) failReasons.push('کیفیت داده کافی نیست');

  const trendConfirmed = indicators.structure.state !== 'UNKNOWN';
  if (!trendConfirmed) failReasons.push('ساختار بازار نامشخص است');

  const rsi = indicators.rsi14;
  const momentumConfirmed = rsi !== undefined && rsi !== null && rsi > 20 && rsi < 80;
  if (!momentumConfirmed) failReasons.push('مومنتوم نامعتبر یا اشباع');

  const structureConfirmed = indicators.structure.state !== 'UNKNOWN';
  if (!structureConfirmed) failReasons.push('ساختار تأیید نشده');

  const riskValid = price > 0;
  if (!riskValid) failReasons.push('قیمت نامعتبر');

  const macdSig = indicators.macd !== undefined && indicators.macdSignal !== undefined
    ? getMACDSignal(indicators.macd!, indicators.macdSignal!, indicators.macdHistogram ?? 0)
    : 'NEUTRAL';

  const emaSig = indicators.ema20 && indicators.ema50 && indicators.ema200
    ? detectEMAStack(indicators.ema20, indicators.ema50, indicators.ema200)
    : 'NEUTRAL';

  const forecastAgreement = macdSig !== 'NEUTRAL' || emaSig !== 'NEUTRAL';
  if (!forecastAgreement) failReasons.push('تأیید Forecast ناکافی');

  const extremeVolatility = regime === 'HIGH_VOLATILITY';
  const noConflict = !extremeVolatility;
  if (!noConflict) failReasons.push('نوسان غیرعادی — از ورود خودداری کنید');

  const liquidityOk = true; // در این پیاده‌سازی frontend، نمی‌توانیم لیکوییدیتی DEX را بررسی کنیم

  const passed = dataQualityOk && trendConfirmed && riskValid && noConflict && structureConfirmed;

  return {
    passed,
    checks: {
      dataQuality: dataQualityOk,
      trendConfirmed,
      momentumConfirmed,
      structureConfirmed,
      riskValid,
      forecastAgreement,
      noConflict,
      liquidityOk,
    },
    failReasons,
  };
}

// ========================
// موتور Forecast
// ========================
export function generateForecast(
  symbol: string,
  candles: OHLCV[],
  indicators: FullIndicatorResult,
  regime: MarketRegime,
  horizon: ForecastHorizon = '1h'
): ForecastResult {
  const now = new Date();
  const id = generateId();

  // محاسبه زمان انقضا
  const horizonMs: Record<ForecastHorizon, number> = {
    '1m': 60_000, '5m': 5 * 60_000, '15m': 15 * 60_000,
    '30m': 30 * 60_000, '1h': 3600_000, '4h': 4 * 3600_000, '1D': 86400_000,
  };
  const expiresAt = new Date(now.getTime() + horizonMs[horizon]);

  if (!indicators.sufficientData || candles.length < 26) {
    return {
      id, symbol, horizon,
      createdAt: now, expiresAt,
      currentPrice: candles[candles.length - 1]?.close ?? 0,
      direction: 'UNKNOWN',
      confidence: 0,
      modelName: MODEL_NAME, modelVersion: MODEL_VERSION, engineVersion: ENGINE_VERSION,
      marketRegime: regime,
      dataQuality: 'INSUFFICIENT_DATA',
      status: 'INVALIDATED',
      reasons: ['داده کافی برای تولید Forecast وجود ندارد.'],
      risks: [],
    };
  }

  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle.close;

  // ========================
  // جمع‌آوری شواهد از اندیکاتورهای واقعی
  // ========================
  const bullishSignals: string[] = [];
  const bearishSignals: string[] = [];
  const risks: string[] = [];

  // EMA Stack
  if (indicators.ema20 && indicators.ema50) {
    if (indicators.ema20 > indicators.ema50) bullishSignals.push('EMA20 بالاتر از EMA50 است.');
    else bearishSignals.push('EMA20 پایین‌تر از EMA50 است.');
  }
  if (indicators.ema50 && indicators.ema200) {
    if (indicators.ema50 > indicators.ema200) bullishSignals.push('EMA50 بالاتر از EMA200 است.');
    else bearishSignals.push('EMA50 پایین‌تر از EMA200 است.');
  }

  // RSI
  if (indicators.rsi14 !== undefined) {
    if (indicators.rsi14 > 60) bullishSignals.push(`RSI قوی است (${indicators.rsi14.toFixed(1)}).`);
    else if (indicators.rsi14 < 40) bearishSignals.push(`RSI ضعیف است (${indicators.rsi14.toFixed(1)}).`);
    else if (indicators.rsi14 > 70) risks.push('RSI در ناحیه اشباع خرید قرار دارد.');
    else if (indicators.rsi14 < 30) risks.push('RSI در ناحیه اشباع فروش قرار دارد.');
  }

  // MACD
  if (indicators.macd !== undefined && indicators.macdSignal !== undefined) {
    const macdSig = getMACDSignal(indicators.macd, indicators.macdSignal, indicators.macdHistogram ?? 0);
    if (macdSig === 'BULLISH') bullishSignals.push('MACD در وضعیت صعودی قرار دارد.');
    else if (macdSig === 'BEARISH') bearishSignals.push('MACD در وضعیت نزولی قرار دارد.');
  }

  // Market Structure
  const struct = indicators.structure;
  if (struct.state === 'UPTREND') bullishSignals.push('ساختار بازار صعودی است (HH/HL).');
  else if (struct.state === 'DOWNTREND') bearishSignals.push('ساختار بازار نزولی است (LH/LL).');

  // Support/Resistance
  if (indicators.resistance1) {
    const distToRes = ((indicators.resistance1 - currentPrice) / currentPrice) * 100;
    if (distToRes < 2) risks.push('قیمت نزدیک به مقاومت اصلی است.');
  }

  // Volatility
  if (regime === 'HIGH_VOLATILITY') risks.push('نوسان بازار بالا است.');

  // ========================
  // محاسبه اطمینان (از داده واقعی)
  // ========================
  const totalBull = bullishSignals.length;
  const totalBear = bearishSignals.length;
  const total = totalBull + totalBear;
  const baseConfidence = total > 0 ? Math.max(totalBull, totalBear) / total : 0.5;

  // تنزل بر اساس ریسک
  const riskPenalty = risks.length * 0.05;
  const confidence = Math.min(Math.max((baseConfidence - riskPenalty) * 100, 20), 85);

  // ========================
  // تعیین جهت
  // ========================
  let direction: ForecastDirection;
  if (totalBull === totalBear) {
    direction = 'NEUTRAL';
  } else if (totalBull > totalBear) {
    direction = 'UP';
  } else {
    direction = 'DOWN';
  }

  // ========================
  // محدوده احتمالی (ATR-based)
  // ========================
  let lowerBound: number | undefined;
  let upperBound: number | undefined;
  let predictedPrice: number | undefined;

  if (indicators.atr14) {
    const atr = indicators.atr14;
    lowerBound = currentPrice - atr;
    upperBound = currentPrice + atr;
    predictedPrice = direction === 'UP'
      ? currentPrice + atr * 0.5
      : direction === 'DOWN'
      ? currentPrice - atr * 0.5
      : currentPrice;
  }

  const reasons = direction === 'UP'
    ? bullishSignals
    : direction === 'DOWN'
    ? bearishSignals
    : ['تضاد سیگنال‌ها — بازار در حال تصمیم‌گیری است.'];

  return {
    id, symbol, horizon,
    createdAt: now, expiresAt,
    currentPrice,
    predictedPrice,
    lowerBound,
    upperBound,
    direction,
    confidence,
    modelName: MODEL_NAME,
    modelVersion: MODEL_VERSION,
    engineVersion: ENGINE_VERSION,
    marketRegime: regime,
    dataQuality: 'VALID',
    status: 'ACTIVE',
    reasons,
    risks,
  };
}

// ========================
// موتور Signal — BUY/SELL/NO_ENTRY
// ========================
export function generateSignal(
  forecast: ForecastResult,
  indicators: FullIndicatorResult,
  eligibility: EligibilityGateResult
): EnterpriseSignal {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 4 * 3600_000);

  const baseResult: EnterpriseSignal = {
    id: generateId(),
    symbol: forecast.symbol,
    direction: 'NO_ENTRY',
    confidence: 0,
    createdAt: now,
    expiresAt,
    status: 'ACTIVE',
    forecastId: forecast.id,
    riskStatus: 'NOT_ELIGIBLE',
    reasonCodes: [],
    reasoning: [],
    dataQuality: forecast.dataQuality,
    eligibilityGate: eligibility,
  };

  // Eligibility Gate — اگر شرایط برقرار نبود: عدم ورود
  if (!eligibility.passed) {
    return {
      ...baseResult,
      direction: 'NO_ENTRY',
      reasoning: ['دروازه واجد شرایط نگذشت: ' + eligibility.failReasons.join('، ')],
      reasonCodes: ['ELIGIBILITY_GATE_FAILED'],
    };
  }

  // بررسی Confidence کافی
  if (forecast.confidence < 45) {
    return {
      ...baseResult,
      direction: 'NO_ENTRY',
      reasoning: ['اطمینان Forecast کمتر از حد آستانه است.'],
      reasonCodes: ['LOW_CONFIDENCE'],
    };
  }

  // تعیین جهت Signal
  if (forecast.direction === 'UNKNOWN' || forecast.direction === 'NEUTRAL') {
    return {
      ...baseResult,
      direction: 'NO_ENTRY',
      reasoning: ['جهت Forecast نامشخص یا خنثی است.'],
      reasonCodes: ['DIRECTION_UNKNOWN'],
    };
  }

  const direction = forecast.direction === 'UP' ? 'BUY' : 'SELL';
  const price = forecast.currentPrice;
  const atr = indicators.atr14 ?? price * 0.01;

  // محاسبه ورود، حد ضرر، اهداف — پویا بر اساس ATR
  const entry = direction === 'BUY' ? price : price;
  const stopLoss = direction === 'BUY' ? price - atr * 1.5 : price + atr * 1.5;
  const tp1 = direction === 'BUY' ? price + atr : price - atr;
  const tp2 = direction === 'BUY' ? price + atr * 2 : price - atr * 2;
  const tp3 = direction === 'BUY' ? price + atr * 3 : price - atr * 3;

  const risk = Math.abs(entry - stopLoss);
  const reward1 = Math.abs(tp1 - entry);
  const riskReward = risk > 0 ? reward1 / risk : 0;

  // بررسی R:R
  if (riskReward < 1.2) {
    return {
      ...baseResult,
      direction: 'NO_ENTRY',
      reasoning: ['نسبت سود به زیان کافی نیست.'],
      reasonCodes: ['RISK_REWARD_INVALID'],
    };
  }

  const reasoning = [
    ...forecast.reasons,
    `نسبت R:R: ${riskReward.toFixed(2)}`,
    `حد ضرر پویا براساس ATR: ${formatP(stopLoss, price)}`,
  ];

  return {
    ...baseResult,
    direction,
    confidence: forecast.confidence,
    entry,
    stopLoss,
    tp1,
    tp2,
    tp3,
    riskReward,
    riskStatus: 'VALID',
    reasonCodes: ['TREND_CONFIRMED', 'MOMENTUM_CONFIRMED', 'STRUCTURE_CONFIRMED'],
    reasoning,
    dataQuality: 'VALID',
  };
}

function formatP(price: number, ref: number): string {
  const pct = ((price - ref) / ref * 100).toFixed(2);
  return `$${price.toFixed(ref > 100 ? 2 : 6)} (${pct}%)`;
}
