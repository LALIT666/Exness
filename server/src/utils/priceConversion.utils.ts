import type { CookieOptions } from "express";
import dotenv from "dotenv";

dotenv.config();

export const PRICE_SCALE = 10000;
export const USD_DECIMALS = 2;
export const USD_SCALE = 100;

// Database ka integer price leke human-readable decimal bana deta hai.
export function convertingIntToDecimal(intPrice: number): number {
  return intPrice / PRICE_SCALE; // 420005000 (integer) ÷ 10000 = 42000.5
}

export function convertingDecimalToInt(price: number): number {
  return Math.round(price * PRICE_SCALE); //42000.5 * 10000 = 420005000.0 and then math.round()
}

export function toDisplayUSD(intUSD: number): number {
  return intUSD / USD_SCALE;
}

export function usdToCent(usd: number): number {
  return Math.round(usd * USD_SCALE);
}

export function calculateProfitOrLoss({
  side,
  openPrice,
  closePrice,
  marginCents,
  leverage,
}: {
  side: "buy" | "sell";
  openPrice: number; // PRICE_SCALE
  closePrice: number; // PRICE_SCALE
  marginCents: number; // USD_SCALE
  leverage: number;
}): number {
  const MONEY_SCALE = 100n;
  const PRICE_SCALE = 10000n;
  const CONVERSION_FACTOR = PRICE_SCALE / MONEY_SCALE; // 100n

  const openP = BigInt(openPrice);
  const closeP = BigInt(closePrice);
  const margin = BigInt(marginCents);
  const lev = BigInt(leverage);

  const marginOnPriceScale = margin * CONVERSION_FACTOR;
  const totalPositionValue = marginOnPriceScale * lev;

  let pnlOnPriceScale = ((closeP - openP) * totalPositionValue) / openP;

  if (side === "sell") {
    pnlOnPriceScale = -pnlOnPriceScale;
  }

  const finalPnl = pnlOnPriceScale / CONVERSION_FACTOR;
  return Number(finalPnl);
}

export function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  };
}
