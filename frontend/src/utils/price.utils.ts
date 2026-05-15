// ---------------------------------------------
// ✅ Price Scaling Constants
// ---------------------------------------------

// Internal price scaling (e.g. 1.2345 → 12345)
export const PRICE_SCALE_FACTOR = 10000;

// USD stored in cents (e.g. $10 → 1000 cents)
export const USD_SCALE_FACTOR = 100;

// ---------------------------------------------
// ✅ Convert Internal Price → Display Price
// ---------------------------------------------

export function convertInternalPriceToDisplay(storedIntegerPrice: number) {
  return Number((storedIntegerPrice / PRICE_SCALE_FACTOR).toFixed(2));
}

// ---------------------------------------------
// ✅ Convert Display Price → Internal Price
// ---------------------------------------------

export function convertDisplayPriceToInternal(normalPrice: number): number {
  return Math.round(normalPrice * PRICE_SCALE_FACTOR);
}

// ---------------------------------------------
// ✅ Convert Cents → USD
// ---------------------------------------------

export function convertCentsToUsd(storedCentsAmount: number) {
  return storedCentsAmount / USD_SCALE_FACTOR;
}

// ---------------------------------------------
// ✅ Convert USD → Cents
// ---------------------------------------------

export function convertUsdToCents(normalUsdAmount: number) {
  return Math.round(normalUsdAmount * USD_SCALE_FACTOR);
}

// ---------------------------------------------
// ✅ Calculate Profit/Loss Safely (BigInt)
// ---------------------------------------------

export function calculateProfitOrLossInCents({
  tradeSide,
  priceWhenTradeStarted,
  priceWhenTradeClosed,
  marginInCents,
  leverageMultiplier,
}: {
  tradeSide: "buy" | "sell";
  priceWhenTradeStarted: number;
  priceWhenTradeClosed: number;
  marginInCents: number;
  leverageMultiplier: number;
}): number {
  const BIGINT_USD_SCALE = 100n;
  const BIGINT_PRICE_SCALE = 10000n;

  const conversionMultiplier = BIGINT_PRICE_SCALE / BIGINT_USD_SCALE;

  const openPriceBig = BigInt(priceWhenTradeStarted);
  const closePriceBig = BigInt(priceWhenTradeClosed);
  const marginBig = BigInt(marginInCents);
  const leverageBig = BigInt(leverageMultiplier);

  // Convert margin to price scale
  const marginOnPriceScale = marginBig * conversionMultiplier;

  const fullPositionValue = marginOnPriceScale * leverageBig;

  let rawProfitOrLoss =
    ((closePriceBig - openPriceBig) * fullPositionValue) / openPriceBig;

  // If SELL trade, reverse sign
  if (tradeSide === "sell") {
    rawProfitOrLoss = -rawProfitOrLoss;
  }

  const finalProfitOrLossInCents = rawProfitOrLoss / conversionMultiplier;

  return Number(finalProfitOrLossInCents);
}
