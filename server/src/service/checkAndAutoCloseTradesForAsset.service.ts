import db from "../db/db";
import { closeOrder } from "../utils/trade.utils";

export async function checkAndAutoCloseTradesForAsset(
  assetSymbol: "BTC" | "ETH" | "SOL",
  latestMarketPrice: { ask: number; bid: number },
) {
  // ✅ Step 1: Get all open trades for this asset
  const allOpenTradesForThisAsset = await db.order.findMany({
    where: {
      asset: assetSymbol,
      status: "OPEN",
    },
  });

  // ✅ Step 2: Loop through each open trade
  for (const singleOpenTrade of allOpenTradesForThisAsset) {
    const userWhoOwnsThisTrade = singleOpenTrade.userId;
    const tradeId = singleOpenTrade.id;

    const currentBidPrice = latestMarketPrice.bid;
    const currentAskPrice = latestMarketPrice.ask;

    // ✅ TAKE PROFIT CHECK
    if (singleOpenTrade.takeProfit) {
      if (
        singleOpenTrade.type === "BUY" &&
        currentBidPrice >= singleOpenTrade.takeProfit
      ) {
        await closeOrder(userWhoOwnsThisTrade, tradeId, "TAKE_PROFIT");
        continue;
      }

      if (
        singleOpenTrade.type === "SELL" &&
        currentAskPrice <= singleOpenTrade.takeProfit
      ) {
        await closeOrder(userWhoOwnsThisTrade, tradeId, "TAKE_PROFIT");
        continue;
      }
    }

    // ✅ STOP LOSS CHECK
    if (singleOpenTrade.stopLoss) {
      if (
        singleOpenTrade.type === "BUY" &&
        currentBidPrice <= singleOpenTrade.stopLoss
      ) {
        await closeOrder(userWhoOwnsThisTrade, tradeId, "STOP_LOSS");
        continue;
      }

      if (
        singleOpenTrade.type === "SELL" &&
        currentAskPrice >= singleOpenTrade.stopLoss
      ) {
        await closeOrder(userWhoOwnsThisTrade, tradeId, "STOP_LOSS");
        continue;
      }
    }

    // ✅ LIQUIDATION CHECK
    if (singleOpenTrade.liquidationPrice) {
      if (
        singleOpenTrade.type === "BUY" &&
        currentBidPrice <= singleOpenTrade.liquidationPrice
      ) {
        await closeOrder(userWhoOwnsThisTrade, tradeId, "LIQUIDATION");
        continue;
      }

      if (
        singleOpenTrade.type === "SELL" &&
        currentAskPrice >= singleOpenTrade.liquidationPrice
      ) {
        await closeOrder(userWhoOwnsThisTrade, tradeId, "LIQUIDATION");
        continue;
      }
    }
  }
}
