export type PriceData = {
  bid: number;
  ask: number;
};

export const PRICESTORE: Record<string, PriceData> = {
  BTC: { bid: 6500000, ask: 6501000 },
  ETH: { bid: 300000, ask: 300500 },
  SOL: { bid: 15000, ask: 15050 },
};
