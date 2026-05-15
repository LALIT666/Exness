import { useEffect, useMemo, useState } from "react";
import {
  closeUserTrade,
  fetchClosedTrades,
  fetchOpenTrades,
} from "../api/trade.api";
import {
  calculateProfitOrLossInCents,
  convertInternalPriceToDisplay,
  convertCentsToUsd,
} from "../utils/price.utils";
import {
  subscribeToLivePrices,
  type LivePrices,
} from "../utils/priceStore.utils";

interface OpenOrder {
  orderId: string;
  type: "buy" | "sell";
  margin: number;
  leverage: number;
  openPrice: number;
  asset?: string;
}

interface ClosedOrder extends OpenOrder {
  closePrice: number;
  pnl: number;
}

export default function OrdersPanel() {
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");

  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);

  const [closedOrders, setClosedOrders] = useState<ClosedOrder[]>([]);

  const [livePrices, setLivePrices] = useState<LivePrices>({
    BTC: { bid: 0, ask: 0 },
    ETH: { bid: 0, ask: 0 },
    SOL: { bid: 0, ask: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);

  /* ------------------------------ */
  /* ✅ Load Orders */
  /* ------------------------------ */

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);

      const token = localStorage.getItem("token") || "";

      if (activeTab === "open") {
        const response = await fetchOpenTrades(token);
        setOpenOrders(response?.trades ?? []);
      } else {
        const response = await fetchClosedTrades(token);
        setClosedOrders(response?.trades ?? []);
      }

      setLoading(false);
    }

    loadOrders();
  }, [activeTab]);

  /* ------------------------------ */
  /* ✅ Subscribe to Live Prices */
  /* ------------------------------ */

  useEffect(() => {
    const unsubscribe = subscribeToLivePrices(setLivePrices);
    return () => unsubscribe();
  }, []);

  /* ------------------------------ */
  /* ✅ Calculate PnL for Open Orders */
  /* ------------------------------ */

  const openOrdersWithPnl = useMemo(() => {
    return openOrders.map((order) => {
      const symbol = (order.asset || "BTC").replace(
        "USDT",
        "",
      ) as keyof LivePrices;

      const price = livePrices[symbol];

      if (!price) return { ...order, pnl: 0 };

      const currentPrice = order.type === "buy" ? price.bid : price.ask;

      const pnlInCents = calculateProfitOrLossInCents({
        tradeSide: order.type,
        priceWhenTradeStarted: order.openPrice,
        priceWhenTradeClosed: currentPrice,
        marginInCents: order.margin,
        leverageMultiplier: order.leverage,
      });

      return {
        ...order,
        pnl: pnlInCents,
      };
    });
  }, [openOrders, livePrices]);

  /* ------------------------------ */
  /* ✅ Close Order */
  /* ------------------------------ */

  async function handleClose(orderId: string) {
    setClosingOrderId(orderId);

    const token = localStorage.getItem("token") || "";

    await closeUserTrade(token, orderId);

    setOpenOrders((prev) => prev.filter((o) => o.orderId !== orderId));

    setClosingOrderId(null);
  }

  /* ------------------------------ */
  /* ✅ UI */
  /* ------------------------------ */

  return (
    <div className="border border-neutral-200 rounded-lg bg-white flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("open")}
          className={`flex-1 py-3 text-sm ${
            activeTab === "open"
              ? "border-b-2 border-black font-medium"
              : "text-neutral-500"
          }`}
        >
          Open Positions
        </button>

        <button
          onClick={() => setActiveTab("closed")}
          className={`flex-1 py-3 text-sm ${
            activeTab === "closed"
              ? "border-b-2 border-black font-medium"
              : "text-neutral-500"
          }`}
        >
          Order History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center text-neutral-500">Loading...</div>
        ) : activeTab === "open" ? (
          openOrdersWithPnl.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 text-xs">
                  <th className="text-left py-3">Symbol</th>
                  <th className="text-right py-3">Type</th>
                  <th className="text-right py-3">Margin</th>
                  <th className="text-right py-3">Open</th>
                  <th className="text-right py-3">Unrealized P&L</th>
                  <th className="text-right py-3"></th>
                </tr>
              </thead>
              <tbody>
                {openOrdersWithPnl.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-neutral-100"
                  >
                    <td className="py-3">{order.asset}</td>

                    <td className="text-right py-3">
                      {order.type.toUpperCase()}
                    </td>

                    <td className="text-right py-3">
                      ${convertCentsToUsd(order.margin)}
                    </td>

                    <td className="text-right py-3">
                      ${convertInternalPriceToDisplay(order.openPrice)}
                    </td>

                    <td
                      className={`text-right py-3 ${
                        order.pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${convertCentsToUsd(order.pnl).toFixed(2)}
                    </td>

                    <td className="text-right py-3">
                      <button
                        onClick={() => handleClose(order.orderId)}
                        disabled={closingOrderId === order.orderId}
                        className="text-sm text-black border border-neutral-200 rounded px-3 py-1 hover:bg-neutral-100"
                      >
                        {closingOrderId === order.orderId
                          ? "Closing..."
                          : "Close"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-neutral-500">
              No open positions
            </div>
          )
        ) : closedOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 text-xs">
                <th className="text-left py-3">Symbol</th>
                <th className="text-right py-3">Type</th>
                <th className="text-right py-3">Margin</th>
                <th className="text-right py-3">P&L</th>
              </tr>
            </thead>
            <tbody>
              {closedOrders.map((order) => (
                <tr key={order.orderId} className="border-b border-neutral-100">
                  <td className="py-3">{order.asset}</td>

                  <td className="text-right py-3">
                    {order.type.toUpperCase()}
                  </td>

                  <td className="text-right py-3">
                    ${convertCentsToUsd(order.margin)}
                  </td>

                  <td
                    className={`text-right py-3 ${
                      order.pnl >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${convertCentsToUsd(order.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-neutral-500">No order history</div>
        )}
      </div>
    </div>
  );
}
