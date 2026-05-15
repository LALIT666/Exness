export const Duration = {
  candles_1m: "1m",
  candles_1w: "1w",
  candles_1d: "1d",
} as const;

//keyof typeof Duration = "candles_1m" | "candles_1w" | "candles_1d"
//(typeof Duration)[keyof typeof Duration] -- "Har key ke liye VALUE nikalo" --- "1m" | "1w" | "1d"
export type Duration = (typeof Duration)[keyof typeof Duration];

export const Channels = {
  SOLUSDT: "SOL",
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
} as const;

export type SYMBOL = (typeof Channels)[keyof typeof Channels];

export const assetIcons = {
  SOL: "https://i.postimg.cc/9MhDvsK9/b2f0c70f-4fb2-4472-9fe7-480ad1592421.png",
  ETH: "https://i.postimg.cc/gcKhPkY2/3a8c9fe6-2a76-4ace-aa07-415d994de6f0.png",
  BTC: "https://i.postimg.cc/TPh0K530/87496d50-2408-43e1-ad4c-78b47b448a6a.png",
} as const;
