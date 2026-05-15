import { useEffect, useState } from "react";
import { assetIcons, type SYMBOL } from "../utils/constants.utils";
import { convertInternalPriceToDisplay } from "../utils/price.utils";
import {
  subscribeToLivePrices,
  type LivePrices,
} from "../utils/priceStore.utils";

export interface Trade {
  bidPrice: number;
  askPrice: number;
  symbol: SYMBOL;
}

export default function AskBidsTable({
  selectedSymbol,
  onSymbolChange,
}: {
  selectedSymbol?: SYMBOL;
  onSymbolChange?: (symbol: SYMBOL) => void;
}) {
  const [prices, setPrices] = useState<LivePrices>({
    BTC: { bid: 0, ask: 0 },
    ETH: { bid: 0, ask: 0 },
    SOL: { bid: 0, ask: 0 },
  });

  useEffect(() => {
    const unsubscribe = subscribeToLivePrices(setPrices);

    return () => unsubscribe();
  }, []);

  return (
    <div className="border border-neutral-200 rounded-lg bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500 text-xs">
            <th className="text-left py-3 px-4">Symbol</th>
            <th className="text-right py-3 px-4">Bid</th>
            <th className="text-right py-3 px-4">Ask</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(prices).map(([symbol, price]) => (
            <tr
              key={symbol}
              onClick={() => onSymbolChange?.(symbol as SYMBOL)}
              className={`cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 ${
                selectedSymbol === symbol ? "bg-neutral-100" : ""
              }`}
            >
              <td className="py-3 px-4 flex items-center gap-3">
                <img
                  src={assetIcons[symbol as keyof typeof assetIcons]}
                  className="h-6 w-6 rounded-full"
                />
                {symbol}
              </td>

              <td className="text-right py-3 px-4 text-green-600">
                {convertInternalPriceToDisplay(price.bid)}
              </td>

              <td className="text-right py-3 px-4 text-red-600">
                {convertInternalPriceToDisplay(price.ask)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
