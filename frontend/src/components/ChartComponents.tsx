/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { SYMBOL } from "../utils/constants.utils";
import { Duration, assetIcons } from "../utils/constants.utils";
import { WebSocketManager } from "../utils/websocketManager.utils";
import {
  fetchInitialChartData,
  handleLivePriceUpdate,
  clearStoredCandle,
  type LivePriceUpdate,
} from "../utils/candleProcessor.utils";
import type { Trade } from "./AskBidsTable";

export default function ChartComponent({
  duration,
  symbol,
  onDurationChange,
  onPriceUpdate,
}: {
  duration: Duration;
  symbol: SYMBOL;
  onDurationChange?: (d: Duration) => void;
  onPriceUpdate?: (p: { bidPrice: number; askPrice: number }) => void;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: IChartApi;
    let series: any;
    let unsubscribe: (() => void) | null = null;

    async function init() {
      chart = createChart(chartContainerRef.current!, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: "#ffffff",
          },
          textColor: "#171717",
        },
        grid: {
          vertLines: { color: "#f3f4f6" },
          horzLines: { color: "#f3f4f6" },
        },
        rightPriceScale: {
          borderColor: "#e5e7eb",
        },
        timeScale: {
          borderColor: "#e5e7eb",
        },
      });

      series = chart.addSeries(CandlestickSeries, {
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderVisible: false,
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      });

      const initialData = await fetchInitialChartData(symbol, duration);

      series.setData(initialData);
      chart.timeScale().fitContent();

      const wsManager = WebSocketManager.getInstance();

      unsubscribe = wsManager.subscribe(symbol, (trade: Trade) => {
        if (trade.symbol !== symbol) return;

        const liveUpdate: LivePriceUpdate = {
          symbol: trade.symbol,
          bidPrice: trade.bidPrice,
          askPrice: trade.askPrice,
          time: Math.floor(Date.now() / 1000),
        };

        const newCandle = handleLivePriceUpdate(liveUpdate, duration);

        series.update(newCandle);

        onPriceUpdate?.({
          bidPrice: trade.bidPrice,
          askPrice: trade.askPrice,
        });
      });

      chartRef.current = chart;
    }

    init();

    return () => {
      unsubscribe?.();
      clearStoredCandle(symbol, duration);
      chart?.remove();
    };
  }, [symbol, duration, onPriceUpdate]);

  return (
    <div className="border border-neutral-200 rounded-lg bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={assetIcons[symbol]}
            alt={symbol}
            className="h-6 w-6 rounded-full"
          />
          <div>
            <div className="text-sm font-semibold">{symbol}/USDT</div>
            <div className="text-xs text-neutral-500">{duration}</div>
          </div>
        </div>

        {onDurationChange && (
          <div className="flex gap-2">
            {(["1m", "1d", "1w"] as Duration[]).map((d) => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                className={`px-3 py-1 text-xs rounded-md border ${
                  duration === d
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  );
}
