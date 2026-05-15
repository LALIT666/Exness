/* eslint-disable @typescript-eslint/no-explicit-any */

import { fetchCandleData } from "../api/trade.api";
import { Duration, type SYMBOL } from "../utils/constants.utils";
import { convertInternalPriceToDisplay } from "../utils/price.utils";

/*
  Live price update ka shape
*/
export interface LivePriceUpdate {
  symbol: SYMBOL;
  bidPrice: number;
  askPrice: number;
  time: number; // unix timestamp
}

/*
  Hum last candle ko yaha store karenge
*/
const lastCandleStorage: Record<string, any> = {};

/*
  Unique key banane ke liye
*/
function createStorageKey(symbol: SYMBOL, duration: Duration) {
  return `${symbol}_${duration}`;
}

/*
  Duration ko seconds me convert karta hai
*/
function getBucketSizeInSeconds(duration: Duration): number {
  switch (duration) {
    case "1m":
      return 60;
    case "1d":
      return 86400;
    case "1w":
      return 604800;
    default:
      return 60;
  }
}

/*
  ✅ Ye function live price ko candle me convert karta hai
*/
export function handleLivePriceUpdate(
  liveTrade: LivePriceUpdate,
  duration: Duration,
) {
  const storageKey = createStorageKey(liveTrade.symbol, duration);

  const bucketSize = getBucketSizeInSeconds(duration);

  const candleTime = Math.floor(liveTrade.time / bucketSize) * bucketSize;

  const price = convertInternalPriceToDisplay(liveTrade.bidPrice);

  let lastCandle = lastCandleStorage[storageKey];

  // ✅ Agar new candle hai
  if (!lastCandle || candleTime > lastCandle.time) {
    lastCandle = {
      time: candleTime,
      open: price,
      high: price,
      low: price,
      close: price,
    };
  } else {
    // ✅ Same candle update
    lastCandle = {
      time: lastCandle.time,
      open: lastCandle.open,
      high: Math.max(lastCandle.high, price),
      low: Math.min(lastCandle.low, price),
      close: price,
    };
  }

  lastCandleStorage[storageKey] = lastCandle;

  return lastCandle;
}

/*
  ✅ Initial chart data load
*/
export async function fetchInitialChartData(
  symbol: SYMBOL,
  duration: Duration,
) {
  const response = await fetchCandleData(symbol, duration);

  if (response?.candles?.length) {
    const last = response.candles[response.candles.length - 1];

    lastCandleStorage[createStorageKey(symbol, duration)] = last;
  }

  return response?.candles ?? [];
}

/*
  ✅ Reset memory
*/
export function clearStoredCandle(symbol: SYMBOL, duration: Duration) {
  const storageKey = createStorageKey(symbol, duration);

  delete lastCandleStorage[storageKey];
}
