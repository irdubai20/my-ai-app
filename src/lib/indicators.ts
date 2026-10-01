// =========================================
// موتور اندیکاتورهای تکنیکال واقعی
// محاسبه از داده OHLCV واقعی — بدون Math.random
// =========================================

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// ========================
// EMA — Exponential Moving Average
// ========================
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  // اولین EMA = SMA دوره اول
  const firstSMA = data.slice(0, period).reduce((s, v) => s + v, 0) / period;
  result.push(firstSMA);
  for (let i = period; i < data.length; i++) {
    result.push(data[i] * k + result[result.length - 1] * (1 - k));
  }
  return result;
}

// ========================
// SMA — Simple Moving Average
// ========================
export function calculateSMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    result.push(slice.reduce((s, v) => s + v, 0) / period);
  }
  return result;
}

// ========================
// RSI — Relative Strength Index
// ========================
export function calculateRSI(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  const result: number[] = [];
  let avgGain = gains.slice(0, period).reduce((s, v) => s + v, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, v) => s + v, 0) / period;

  if (avgLoss === 0) {
    result.push(100);
  } else {
    result.push(100 - 100 / (1 + avgGain / avgLoss));
  }

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    if (avgLoss === 0) {
      result.push(100);
    } else {
      result.push(100 - 100 / (1 + avgGain / avgLoss));
    }
  }

  return result;
}

// ========================
// MACD
// ========================
export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult | null {
  if (closes.length < slowPeriod + signalPeriod) return null;

  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  // تراز کردن طول‌ها
  const diff = emaFast.length - emaSlow.length;
  const fastAligned = emaFast.slice(diff);

  const macdLine = fastAligned.map((v, i) => v - emaSlow[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histOffset = macdLine.length - signalLine.length;
  const histogram = signalLine.map((s, i) => macdLine[i + histOffset] - s);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  };
}

// ========================
// ATR — Average True Range
// ========================
export function calculateATR(candles: OHLCV[], period = 14): number[] {
  if (candles.length < period + 1) return [];

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const highLow = candles[i].high - candles[i].low;
    const highClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowClose = Math.abs(candles[i].low - candles[i - 1].close);
    trueRanges.push(Math.max(highLow, highClose, lowClose));
  }

  const result: number[] = [];
  let atr = trueRanges.slice(0, period).reduce((s, v) => s + v, 0) / period;
  result.push(atr);

  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push(atr);
  }

  return result;
}

// ========================
// ADX — Average Directional Index
// ========================
export interface ADXResult {
  adx: number[];
  diPlus: number[];
  diMinus: number[];
}

export function calculateADX(candles: OHLCV[], period = 14): ADXResult | null {
  if (candles.length < period * 2) return null;

  const trueRanges: number[] = [];
  const plusDMs: number[] = [];
  const minusDMs: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const highDiff = candles[i].high - candles[i - 1].high;
    const lowDiff = candles[i - 1].low - candles[i].low;
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trueRanges.push(tr);
    plusDMs.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    minusDMs.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
  }

  const smoothTR = smoothWilder(trueRanges, period);
  const smoothDMPlus = smoothWilder(plusDMs, period);
  const smoothDMMinus = smoothWilder(minusDMs, period);

  const len = Math.min(smoothTR.length, smoothDMPlus.length, smoothDMMinus.length);
  const diPlus = smoothDMPlus.slice(0, len).map((v, i) => smoothTR[i] !== 0 ? (v / smoothTR[i]) * 100 : 0);
  const diMinus = smoothDMMinus.slice(0, len).map((v, i) => smoothTR[i] !== 0 ? (v / smoothTR[i]) * 100 : 0);

  const dx = diPlus.map((p, i) => {
    const sum = p + diMinus[i];
    return sum !== 0 ? (Math.abs(p - diMinus[i]) / sum) * 100 : 0;
  });

  const adx = calculateEMA(dx, period);

  return { adx, diPlus, diMinus };
}

function smoothWilder(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const result: number[] = [];
  let sum = data.slice(0, period).reduce((s, v) => s + v, 0);
  result.push(sum);
  for (let i = period; i < data.length; i++) {
    sum = sum - sum / period + data[i];
    result.push(sum);
  }
  return result;
}

// ========================
// Bollinger Bands
// ========================
export interface BollingerResult {
  upper: number[];
  middle: number[];
  lower: number[];
  width: number[];
}

export function calculateBollinger(closes: number[], period = 20, stdDevMultiplier = 2): BollingerResult | null {
  if (closes.length < period) return null;

  const middle = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const width: number[] = [];

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const variance = slice.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    const idx = i - (period - 1);
    upper.push(middle[idx] + stdDevMultiplier * stdDev);
    lower.push(middle[idx] - stdDevMultiplier * stdDev);
    width.push(middle[idx] !== 0 ? ((upper[upper.length - 1] - lower[lower.length - 1]) / middle[idx]) * 100 : 0);
  }

  return { upper, middle, lower, width };
}

// ========================
// Standard Deviation
// ========================
export function calculateStdDev(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const variance = slice.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / period;
    result.push(Math.sqrt(variance));
  }
  return result;
}

// ========================
// Stochastic Oscillator
// ========================
export function calculateStochastic(candles: OHLCV[], kPeriod = 14, dPeriod = 3): { k: number[]; d: number[] } | null {
  if (candles.length < kPeriod) return null;

  const kValues: number[] = [];
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...slice.map(c => c.high));
    const lowestLow = Math.min(...slice.map(c => c.low));
    const range = highestHigh - lowestLow;
    kValues.push(range !== 0 ? ((candles[i].close - lowestLow) / range) * 100 : 50);
  }

  const dValues = calculateSMA(kValues, dPeriod);
  return { k: kValues, d: dValues };
}

// ========================
// CCI — Commodity Channel Index
// ========================
export function calculateCCI(candles: OHLCV[], period = 20): number[] {
  if (candles.length < period) return [];
  const result: number[] = [];
  const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);

  for (let i = period - 1; i < candles.length; i++) {
    const slice = typicalPrices.slice(i - period + 1, i + 1);
    const meanPrice = slice.reduce((s, v) => s + v, 0) / period;
    const meanDeviation = slice.reduce((s, v) => s + Math.abs(v - meanPrice), 0) / period;
    result.push(meanDeviation !== 0 ? (typicalPrices[i] - meanPrice) / (0.015 * meanDeviation) : 0);
  }
  return result;
}

// ========================
// ROC — Rate of Change
// ========================
export function calculateROC(closes: number[], period = 12): number[] {
  const result: number[] = [];
  for (let i = period; i < closes.length; i++) {
    result.push(closes[i - period] !== 0 ? ((closes[i] - closes[i - period]) / closes[i - period]) * 100 : 0);
  }
  return result;
}

// ========================
// VWAP — Volume Weighted Average Price
// ========================
export function calculateVWAP(candles: OHLCV[]): number | null {
  const withVolume = candles.filter(c => c.volume !== undefined && c.volume > 0);
  if (withVolume.length === 0) return null;

  let sumPV = 0;
  let sumV = 0;
  for (const c of withVolume) {
    const tp = (c.high + c.low + c.close) / 3;
    sumPV += tp * (c.volume ?? 0);
    sumV += c.volume ?? 0;
  }
  return sumV !== 0 ? sumPV / sumV : null;
}

// ========================
// OHLCV Validation — بدون Math.random
// ========================
export function validateOHLCV(candle: OHLCV): boolean {
  if (candle.high < candle.low) return false;
  if (candle.close > candle.high) return false;
  if (candle.close < candle.low) return false;
  if (candle.open > candle.high) return false;
  if (candle.open < candle.low) return false;
  if (candle.high <= 0 || candle.low <= 0) return false;
  return true;
}

// ========================
// Market Structure Detection
// ========================
export interface StructureResult {
  higherHigh: boolean;
  higherLow: boolean;
  lowerHigh: boolean;
  lowerLow: boolean;
  state: 'UPTREND' | 'DOWNTREND' | 'RANGE' | 'UNKNOWN';
  swing: number;
}

export function detectMarketStructure(candles: OHLCV[], lookback = 5): StructureResult {
  if (candles.length < lookback * 2 + 1) {
    return { higherHigh: false, higherLow: false, lowerHigh: false, lowerLow: false, state: 'UNKNOWN', swing: 0 };
  }

  const recentHighs = candles.slice(-lookback * 2).map(c => c.high);
  const recentLows = candles.slice(-lookback * 2).map(c => c.low);

  const midPoint = lookback;
  const firstHalf = recentHighs.slice(0, midPoint);
  const secondHalf = recentHighs.slice(midPoint);
  const prevHigh = Math.max(...firstHalf);
  const currHigh = Math.max(...secondHalf);

  const firstHalfLow = recentLows.slice(0, midPoint);
  const secondHalfLow = recentLows.slice(midPoint);
  const prevLow = Math.min(...firstHalfLow);
  const currLow = Math.min(...secondHalfLow);

  const higherHigh = currHigh > prevHigh;
  const higherLow = currLow > prevLow;
  const lowerHigh = currHigh < prevHigh;
  const lowerLow = currLow < prevLow;

  let state: StructureResult['state'] = 'RANGE';
  if (higherHigh && higherLow) state = 'UPTREND';
  else if (lowerHigh && lowerLow) state = 'DOWNTREND';
  else state = 'RANGE';

  return { higherHigh, higherLow, lowerHigh, lowerLow, state, swing: currHigh - currLow };
}

// ========================
// Support / Resistance
// ========================
export interface SRLevels {
  supports: number[];
  resistances: number[];
}

export function calculateSupportResistance(candles: OHLCV[], lookback = 20): SRLevels {
  if (candles.length < lookback) return { supports: [], resistances: [] };

  const swingHighs: number[] = [];
  const swingLows: number[] = [];

  for (let i = 3; i < candles.length - 3; i++) {
    const window = candles.slice(i - 3, i + 4);
    const high = candles[i].high;
    const low = candles[i].low;
    if (window.every(c => c.high <= high)) swingHighs.push(high);
    if (window.every(c => c.low >= low)) swingLows.push(low);
  }

  // گرفتن ۳ سطح برتر
  const uniqueResistances = [...new Set(swingHighs)].sort((a, b) => b - a).slice(0, 3);
  const uniqueSupports = [...new Set(swingLows)].sort((a, b) => a - b).slice(0, 3);

  return { supports: uniqueSupports, resistances: uniqueResistances };
}

// ========================
// تشخیص روند از EMA Stack
// ========================
export function detectEMAStack(ema20: number, ema50: number, ema200: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (ema20 > ema50 && ema50 > ema200) return 'BULLISH';
  if (ema20 < ema50 && ema50 < ema200) return 'BEARISH';
  return 'NEUTRAL';
}

// ========================
// تشخیص وضعیت RSI
// ========================
export function getRSIStatus(rsi: number): { label: string; color: string } {
  if (rsi > 70) return { label: 'اشباع خرید', color: 'text-red-400' };
  if (rsi < 30) return { label: 'اشباع فروش', color: 'text-green-400' };
  if (rsi > 60) return { label: 'قوی', color: 'text-blue-400' };
  if (rsi < 40) return { label: 'ضعیف', color: 'text-orange-400' };
  return { label: 'خنثی', color: 'text-muted-foreground' };
}

// ========================
// تشخیص وضعیت MACD
// ========================
export function getMACDSignal(macd: number, signal: number, histogram: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (macd > signal && histogram > 0) return 'BULLISH';
  if (macd < signal && histogram < 0) return 'BEARISH';
  return 'NEUTRAL';
}

// ========================
// محاسبه اندیکاتورها از کندل‌های واقعی CoinGecko
// ========================
export interface FullIndicatorResult {
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi14?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  atr14?: number;
  bollingerUpper?: number;
  bollingerMiddle?: number;
  bollingerLower?: number;
  bollingerWidth?: number;
  support1?: number;
  support2?: number;
  resistance1?: number;
  resistance2?: number;
  structure: ReturnType<typeof detectMarketStructure>;
  sufficientData: boolean;
}

export function calculateFullIndicators(candles: OHLCV[]): FullIndicatorResult {
  const closes = candles.map(c => c.close);
  const MIN_CANDLES = 26;

  if (candles.length < MIN_CANDLES) {
    return {
      structure: detectMarketStructure(candles),
      sufficientData: false,
    };
  }

  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = closes.length >= 200 ? calculateEMA(closes, 200) : [];
  const rsiArr = calculateRSI(closes, 14);
  const macdResult = calculateMACD(closes);
  const atrArr = calculateATR(candles, 14);
  const bollResult = calculateBollinger(closes, 20);
  const sr = calculateSupportResistance(candles, 20);

  return {
    ema20: ema20Arr[ema20Arr.length - 1],
    ema50: ema50Arr[ema50Arr.length - 1],
    ema200: ema200Arr[ema200Arr.length - 1],
    rsi14: rsiArr[rsiArr.length - 1],
    macd: macdResult?.macd[macdResult.macd.length - 1],
    macdSignal: macdResult?.signal[macdResult.signal.length - 1],
    macdHistogram: macdResult?.histogram[macdResult.histogram.length - 1],
    atr14: atrArr[atrArr.length - 1],
    bollingerUpper: bollResult?.upper[bollResult.upper.length - 1],
    bollingerMiddle: bollResult?.middle[bollResult.middle.length - 1],
    bollingerLower: bollResult?.lower[bollResult.lower.length - 1],
    bollingerWidth: bollResult?.width[bollResult.width.length - 1],
    support1: sr.supports[0],
    support2: sr.supports[1],
    resistance1: sr.resistances[0],
    resistance2: sr.resistances[1],
    structure: detectMarketStructure(candles),
    sufficientData: true,
  };
}
