import { WebSocketManager } from "./websocketManager.utils";
import { Channels } from "./constants.utils";

/*
  ✅ Supported symbols
*/
export type BaseSymbol = "BTC" | "ETH" | "SOL";

/*
  ✅ Price structure for one symbol
*/
export interface SymbolPrice {
  bid: number;
  ask: number;
}

/*
  ✅ All live prices structure
*/
export type LivePrices = Record<BaseSymbol, SymbolPrice>;

/*
  ✅ Listener type
*/
type PriceListener = (prices: LivePrices) => void;

/*
  ✅ Store latest prices in memory
*/
let latestPrices: LivePrices = {
  BTC: { bid: 0, ask: 0 },
  ETH: { bid: 0, ask: 0 },
  SOL: { bid: 0, ask: 0 },
};

/*
  ✅ Store active listeners
*/
const listeners = new Set<PriceListener>();

/*
  ✅ Prevent multiple initialization
*/
let hasInitialized = false;

/*
  ✅ Notify all listeners when prices update
*/
function notifyAll() {
  listeners.forEach((listener) => listener(latestPrices));
}

/*
  ✅ Initialize WebSocket subscriptions once
*/
function startListeningToWebSocket() {
  if (hasInitialized) return;

  hasInitialized = true;

  const wsManager = WebSocketManager.getInstance();

  const handleIncomingData = (data: unknown) => {
    const parsed = (data || {}) as {
      symbol?: string;
      bidPrice?: number;
      askPrice?: number;
    };

    if (!parsed.symbol) return;

    const baseSymbol = parsed.symbol.replace("USDT", "") as BaseSymbol;

    if (!(baseSymbol in latestPrices)) return;

    latestPrices = {
      ...latestPrices,
      [baseSymbol]: {
        bid: parsed.bidPrice ?? latestPrices[baseSymbol].bid,
        ask: parsed.askPrice ?? latestPrices[baseSymbol].ask,
      },
    };

    notifyAll();
  };

  // ✅ Use correct subscribe method (NOT watch)
  wsManager.subscribe(Channels.BTCUSDT, handleIncomingData);
  wsManager.subscribe(Channels.ETHUSDT, handleIncomingData);
  wsManager.subscribe(Channels.SOLUSDT, handleIncomingData);
}

/*
  ✅ Public function to subscribe to live prices
*/
export function subscribeToLivePrices(listener: PriceListener): () => void {
  startListeningToWebSocket();

  listeners.add(listener);

  // Immediately send current state
  listener(latestPrices);

  return () => {
    listeners.delete(listener);
  };
}
