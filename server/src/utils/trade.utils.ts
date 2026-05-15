import db from "../db/db";
import { PRICESTORE } from "../store/price.store";
import { calculateProfitOrLoss } from "./priceConversion.utils";

export async function closeOrder(
  userId: string,
  orderId: string,
  reason: "MANUAL" | "TAKE_PROFIT" | "STOP_LOSS" | "LIQUIDATION",
) {
  // ✅ Step 1: Get order from DB
  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) return null;
  if (existingOrder.userId !== userId) return null;
  if (existingOrder.status !== "OPEN") return null;

  // ✅ Step 2: Get latest market price
  const currentPrice = PRICESTORE[existingOrder.asset];

  if (!currentPrice) return null;

  const priceAtClose =
    existingOrder.type === "BUY" ? currentPrice.bid : currentPrice.ask;

  // ✅ Step 3: Calculate PnL
  const pnl = calculateProfitOrLoss({
    side: existingOrder.type.toLowerCase() as "buy" | "sell",
    openPrice: existingOrder.openPrice, //priceWhenTradeStarted
    closePrice: priceAtClose, //priceWhenTradeClosed
    marginCents: existingOrder.margin, //userMarginInCents
    leverage: existingOrder.leverage, //leverageMultiplier
  });

  await db.$transaction([
    // Update user balance
    db.user.update({
      where: { id: userId },
      data: {
        balanceUsd: {
          increment: existingOrder.margin + pnl,
        },
        marginUsed: {
          decrement: existingOrder.margin,
        },
      },
    }),

    // Update order status
    db.order.update({
      where: { id: orderId },
      data: {
        status: reason === "LIQUIDATION" ? "LIQUIDATED" : "CLOSED",
        closePrice: priceAtClose,
        pnl: pnl,
        closeReason: reason,
        closedAt: new Date(),
      },
    }),

    // Optional: create transaction entry
    db.transaction.create({
      data: {
        userId: userId,
        type: "TRADE_PNL",
        amount: pnl,
      },
    }),
  ]);

  console.log(
    `Order ${orderId} closed for user ${userId}. Reason: ${reason}. PnL: ${pnl}`,
  );

  return pnl;
}
