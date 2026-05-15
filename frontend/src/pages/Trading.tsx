import { useEffect, useState } from "react";
import ChartComponent from "../components/ChartComponents";
import { Channels, Duration } from "../utils/constants.utils";
import type { SYMBOL } from "../utils/constants.utils";
import AskBidsTable from "../components/AskBidsTable";
import { fetchUserBalance } from "../api/trade.api";
import { useNavigate } from "react-router-dom";
import OrdersPanel from "../components/OrdersPanel";
import TradePanel from "../components/TradePannel";
import { convertInternalPriceToDisplay } from "../utils/price.utils";

export default function Trading() {
  const [duration, setDuration] = useState<Duration>("1m");

  const [selectedSymbol, setSelectedSymbol] = useState<SYMBOL>(
    Channels.BTCUSDT,
  );

  const [currentPrices, setCurrentPrices] = useState({
    askPrice: 0,
    bidPrice: 0,
  });

  const navigate = useNavigate();

  /* ✅ Check if user logged in */
  useEffect(() => {
    async function checkUser() {
      try {
        const data = await fetchUserBalance();

        if (!data?.usd_balance) {
          localStorage.removeItem("token");
          navigate("/signin");
        }
      } catch {
        navigate("/signin");
      }
    }

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top Bar */}
      <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-black text-white flex items-center justify-center rounded-md text-sm font-semibold">
            E
          </div>
          <span className="text-sm font-semibold tracking-tight">Exness</span>
        </div>

        <span className="text-xs text-neutral-500">Live Trading</span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6 p-6 h-[calc(100vh-72px)]">
        {/* Market Table */}
        <div className="col-span-12 md:col-span-2 border border-neutral-200 rounded-lg bg-white overflow-auto">
          <div className="p-4 border-b border-neutral-200 text-sm font-medium text-neutral-600">
            Markets
          </div>

          <div className="p-4">
            <AskBidsTable
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
            />
          </div>
        </div>

        {/* Chart + Orders */}
        <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
          <div className="flex-1 border border-neutral-200 rounded-lg bg-white">
            <ChartComponent
              symbol={selectedSymbol}
              duration={duration}
              onDurationChange={setDuration}
              onPriceUpdate={setCurrentPrices}
            />
          </div>

          <div className="h-[35%] border border-neutral-200 rounded-lg bg-white overflow-auto">
            <OrdersPanel />
          </div>
        </div>

        {/* Trade Panel */}
        <div className="col-span-12 md:col-span-3 border border-neutral-200 rounded-lg bg-white p-6">
          <TradePanel
            symbol={selectedSymbol}
            buyPrice={convertInternalPriceToDisplay(currentPrices.askPrice)}
            sellPrice={convertInternalPriceToDisplay(currentPrices.bidPrice)}
          />
        </div>
      </div>
    </div>
  );
}
