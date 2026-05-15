/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import {
  convertUsdToCents,
  convertInternalPriceToDisplay,
} from "../utils/price.utils";

import type { SYMBOL } from "../utils/constants.utils";
import type { Asset } from "../types/asset.types";

const PORT = 3000;

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? `http://localhost:${PORT}/api/v1`;

/* ----------------------------------------------------
   📊 Fetch Candle Data
---------------------------------------------------- */

export async function fetchCandleData(
  assetSymbol: SYMBOL,
  timeDuration: string,
  optionalStartTime?: number,
  optionalEndTime?: number,
) {
  const currentUnixTime = Math.floor(Date.now() / 1000);

  const startTime = optionalStartTime ?? currentUnixTime - 3600;

  const endTime = optionalEndTime ?? currentUnixTime;

  const response = await axios.get(`${API_BASE_URL}/candles`, {
    params: {
      asset: assetSymbol,
      ts: timeDuration,
      startTime,
      endTime,
    },
  });

  if (response.data && Array.isArray(response.data.candles)) {
    response.data.candles = response.data.candles.map((candle: any) => ({
      open: convertInternalPriceToDisplay(candle.open),
      high: convertInternalPriceToDisplay(candle.high),
      low: convertInternalPriceToDisplay(candle.low),
      close: convertInternalPriceToDisplay(candle.close),
      time: candle.timestamp,
      decimal: candle.decimal,
    }));
  }

  return response.data;
}

/* ----------------------------------------------------
   👤 Sign Up
---------------------------------------------------- */

export async function signUpUser(userEmail: string, userPassword: string) {
  const response = await axios.post(
    `${API_BASE_URL}/user/signup`,
    {
      email: userEmail,
      password: userPassword,
    },
    { withCredentials: true },
  );

  return response.data;
}

/* ----------------------------------------------------
   🔐 Sign In
---------------------------------------------------- */

export async function signInUser(userEmail: string, userPassword: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/signin`,
      {
        email: userEmail,
        password: userPassword,
      },
      { withCredentials: true },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
}

/* ----------------------------------------------------
   💰 Fetch User Balance
---------------------------------------------------- */

export async function fetchUserBalance() {
  const authToken = localStorage.getItem("token");

  const response = await axios.get(`${API_BASE_URL}/user/balance`, {
    headers: {
      Authorization: authToken,
    },
    withCredentials: true,
  });

  return response.data;
}

/* ----------------------------------------------------
   📂 Fetch Open Trades
---------------------------------------------------- */

export async function fetchOpenTrades(authToken: string) {
  const response = await axios.get(`${API_BASE_URL}/trades/open`, {
    headers: { Authorization: authToken },
    withCredentials: true,
  });

  return response.data;
}

/* ----------------------------------------------------
   📁 Fetch Closed Trades
---------------------------------------------------- */

export async function fetchClosedTrades(authToken: string) {
  const response = await axios.get(`${API_BASE_URL}/trades`, {
    headers: { Authorization: authToken },
    withCredentials: true,
  });

  return response.data;
}

/* ----------------------------------------------------
   ❌ Close Trade
---------------------------------------------------- */

export async function closeUserTrade(authToken: string, orderId: string) {
  const response = await axios.post(
    `${API_BASE_URL}/trade/close`,
    { orderId },
    {
      headers: { Authorization: authToken },
      withCredentials: true,
    },
  );

  return response.data;
}

/* ----------------------------------------------------
   🚀 Create Trade
---------------------------------------------------- */

export async function createNewTrade({
  assetSymbol,
  tradeSide,
  marginAmount,
  leverageMultiplier,
  isTakeProfitEnabled,
  takeProfitPrice,
  isStopLossEnabled,
  stopLossPrice,
  authToken,
}: {
  assetSymbol: SYMBOL;
  tradeSide: "buy" | "sell";
  marginAmount: number;
  leverageMultiplier: number;
  isTakeProfitEnabled: boolean;
  takeProfitPrice: string;
  isStopLossEnabled: boolean;
  stopLossPrice: string;
  authToken: string;
}) {
  const requestPayload: Record<string, unknown> = {
    asset: assetSymbol,
    type: tradeSide,
    leverage: leverageMultiplier,
    margin: convertUsdToCents(marginAmount),
  };

  if (isTakeProfitEnabled) {
    requestPayload.takeProfit = Number(takeProfitPrice);
  }

  if (isStopLossEnabled) {
    requestPayload.stopLoss = Number(stopLossPrice);
  }

  const response = await axios.post(`${API_BASE_URL}/trade`, requestPayload, {
    headers: { Authorization: authToken },
    withCredentials: true,
  });

  return response.data;
}

/* ----------------------------------------------------
   🪙 Fallback Assets
---------------------------------------------------- */

export const fallbackAssets: Asset[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    buyPrice: 65000,
    sellPrice: 64500,
    decimals: 4,
    imageUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    buyPrice: 3500,
    sellPrice: 3450,
    decimals: 4,
    imageUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    name: "Solana",
    symbol: "SOL",
    buyPrice: 180,
    sellPrice: 178,
    decimals: 4,
    imageUrl: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
];

/* ----------------------------------------------------
   📦 Fetch Asset Details
---------------------------------------------------- */

export async function fetchAssetDetails(): Promise<Asset[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/asset`);

    return response.data.assets ?? fallbackAssets;
  } catch (error) {
    console.error("Failed to fetch assets, using fallback.", error);
    return fallbackAssets;
  }
}
