// ✅ Type for incoming trade data
import type { Trade } from "../components/AskBidsTable";

const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ?? "ws://localhost:8080";

/*
  ✅ This class handles:
  - WebSocket connection
  - Subscribing to symbols
  - Unsubscribing
  - Sending live price updates to listeners
*/
export class WebSocketManager {
  private static singleInstance: WebSocketManager;

  private socket: WebSocket;
  private isConnected: boolean = false;

  // ✅ Store callbacks for each symbol
  private symbolListeners: Record<string, Array<(trade: Trade) => void>> = {};

  // ✅ Count how many components subscribed per symbol
  private symbolSubscriptionCount: Record<string, number> = {};

  // ✅ Messages to send when socket connects
  private pendingMessages: Record<string, unknown>[] = [];

  private constructor() {
    this.socket = new WebSocket(WEBSOCKET_URL);
    this.setupWebSocketEvents();
  }

  /*
    ✅ Get single instance (Singleton pattern)
  */
  public static getInstance() {
    if (!this.singleInstance) {
      this.singleInstance = new WebSocketManager();
    }
    return this.singleInstance;
  }

  /*
    ✅ Send message to WebSocket safely
  */
  private sendMessage(message: Record<string, unknown>) {
    if (!this.isConnected) {
      this.pendingMessages.push(message);
      return;
    }

    this.socket.send(JSON.stringify(message));
  }

  /*
    ✅ Subscribe to symbol updates
  */
  public subscribe(
    symbol: string,
    callback: (trade: Trade) => void,
  ): () => void {
    if (!this.symbolListeners[symbol]) {
      this.symbolListeners[symbol] = [];
    }

    this.symbolListeners[symbol].push(callback);

    const previousCount = this.symbolSubscriptionCount[symbol] ?? 0;

    this.symbolSubscriptionCount[symbol] = previousCount + 1;

    if (previousCount === 0) {
      this.sendMessage({
        type: "SUBSCRIBE",
        symbol,
      });
    }

    return () => {
      this.unsubscribe(symbol, callback);
    };
  }

  /*
    ✅ Unsubscribe from symbol
  */
  private unsubscribe(symbol: string, callback: (trade: Trade) => void) {
    const existingCallbacks = this.symbolListeners[symbol] ?? [];

    this.symbolListeners[symbol] = existingCallbacks.filter(
      (cb) => cb !== callback,
    );

    const currentCount = this.symbolSubscriptionCount[symbol] ?? 0;

    if (currentCount <= 1) {
      delete this.symbolSubscriptionCount[symbol];
      delete this.symbolListeners[symbol];

      this.sendMessage({
        type: "UNSUBSCRIBE",
        symbol,
      });
    } else {
      this.symbolSubscriptionCount[symbol] = currentCount - 1;
    }
  }

  /*
    ✅ Setup WebSocket events
  */
  private setupWebSocketEvents() {
    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");
      this.isConnected = true;

      // Resubscribe to symbols
      Object.keys(this.symbolSubscriptionCount).forEach((symbol) => {
        this.socket.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            symbol,
          }),
        );
      });

      // Send pending messages
      this.pendingMessages.forEach((msg) => {
        this.socket.send(JSON.stringify(msg));
      });

      this.pendingMessages = [];
    };

    this.socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      const symbol = parsedData.symbol;

      if (this.symbolListeners[symbol]) {
        this.symbolListeners[symbol].forEach((callback) =>
          callback(parsedData),
        );
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = () => {
      console.warn("WebSocket disconnected. Reconnecting...");
      this.isConnected = false;

      setTimeout(() => {
        this.socket = new WebSocket(WEBSOCKET_URL);
        this.setupWebSocketEvents();
      }, 5000);
    };
  }

  /*
    ✅ Debug helper
  */
  public getCurrentSubscriptions() {
    return {
      activeSymbols: Object.keys(this.symbolListeners),
      subscriptionCounts: {
        ...this.symbolSubscriptionCount,
      },
    };
  }
}
