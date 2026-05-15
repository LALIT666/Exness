import { useEffect, useMemo, useState } from "react";
import { createNewTrade, fetchUserBalance } from "../api/trade.api";
import {
  calculateProfitOrLossInCents,
  convertInternalPriceToDisplay,
  convertDisplayPriceToInternal,
} from "../utils/price.utils";
import type { SYMBOL } from "../utils/constants.utils";

export default function TradePanel({
  buyPrice,
  sellPrice,
  symbol,
}: {
  buyPrice: number;
  sellPrice: number;
  symbol: SYMBOL;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [margin, setMargin] = useState(100);
  const [leverage, setLeverage] = useState(1);
  const [takeProfit, setTakeProfit] = useState("");
  const [enableTP, setEnableTP] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBalance() {
      const data = await fetchUserBalance();
      if (data?.usd_balance) {
        setBalance(data.usd_balance);
      }
    }
    loadBalance();
  }, []);

  const estimatedProfit = useMemo(() => {
    if (!enableTP || !takeProfit) return 0;

    const openPrice =
      side === "buy"
        ? convertDisplayPriceToInternal(buyPrice)
        : convertDisplayPriceToInternal(sellPrice);

    const closePrice = convertDisplayPriceToInternal(Number(takeProfit));

    return calculateProfitOrLossInCents({
      tradeSide: side,
      priceWhenTradeStarted: openPrice,
      priceWhenTradeClosed: closePrice,
      marginInCents: margin * 100,
      leverageMultiplier: leverage,
    });
  }, [enableTP, takeProfit, side, buyPrice, sellPrice, margin, leverage]);

  async function placeOrder() {
    if (margin <= 0) {
      setError("Margin must be greater than 0");
      return;
    }

    if (margin > balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token") || "";

      await createNewTrade({
        assetSymbol: symbol,
        tradeSide: side,
        marginAmount: margin,
        leverageMultiplier: leverage,
        isTakeProfitEnabled: enableTP,
        takeProfitPrice: takeProfit,
        isStopLossEnabled: false,
        stopLossPrice: "",
        authToken: token,
      });
    } catch {
      setError("Order failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-6 bg-white text-neutral-900 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Trade</h2>
        <span className="text-sm text-neutral-500">
          Balance: ${convertInternalPriceToDisplay(balance)}
        </span>
      </div>

      {/* BUY / SELL */}
      <div className="flex rounded-md border border-neutral-200 overflow-hidden">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 text-sm ${
            side === "buy" ? "bg-black text-white" : "bg-white text-neutral-600"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 text-sm ${
            side === "sell"
              ? "bg-black text-white"
              : "bg-white text-neutral-600"
          }`}
        >
          Sell
        </button>
      </div>

      {/* PRICE */}
      <div className="text-sm text-neutral-600">
        Current Price: ${side === "buy" ? buyPrice : sellPrice}
      </div>

      {/* MARGIN */}
      <div>
        <label className="text-sm block mb-2">Margin (USD)</label>
        <input
          type="number"
          value={margin}
          onChange={(e) => setMargin(Number(e.target.value))}
          className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* LEVERAGE */}
      <div>
        <label className="text-sm block mb-2">Leverage</label>
        <select
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
        >
          {[1, 5, 10, 20, 100].map((l) => (
            <option key={l} value={l}>
              {l}x
            </option>
          ))}
        </select>
      </div>

      {/* TAKE PROFIT */}
      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enableTP}
            onChange={(e) => setEnableTP(e.target.checked)}
          />
          Take Profit
        </label>

        {enableTP && (
          <>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Target price"
              className="w-full mt-2 border border-neutral-200 rounded-md px-3 py-2 text-sm"
            />
            <div className="text-xs text-neutral-500 mt-1">
              Estimated Profit: $
              {convertInternalPriceToDisplay(Math.abs(estimatedProfit)).toFixed(
                2,
              )}
            </div>
          </>
        )}
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-neutral-800"
      >
        {loading
          ? "Processing..."
          : side === "buy"
            ? "Place Buy Order"
            : "Place Sell Order"}
      </button>
    </div>
  );
}
