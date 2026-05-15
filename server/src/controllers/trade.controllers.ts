import type { Request, Response } from "express";
import z from "zod";
import db from "../db/db";
import { PRICESTORE } from "../store/price.store";

const tradeSchema = z.object({
  asset: z.enum(["BTC", "ETH", "SOL"]),
  type: z.enum(["BUY", "SELL"]),
  margin: z.number().positive(),
  leverage: z.coerce
    .number()
    .refine((val) => [1, 5, 10, 20, 100].includes(val), {
      message: "Invalid leverage value",
    }),

  takeProfit: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
});

export async function openTrade(req: Request, res: Response) {
  try {
    const checkInput = tradeSchema.safeParse(req.body);

    if (!checkInput.success) {
      return res.status(411).json({
        success: false,
        message: "Incorrect Credentials",
        error: checkInput.error.flatten().fieldErrors,
      });
    }

    let { asset, type, margin, leverage, takeProfit, stopLoss } =
      checkInput.data;

    const loggedInUserId = req.userId;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const loggedInUser = await db.user.findUnique({
      where: {
        id: loggedInUserId,
      },
    });

    if (!loggedInUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    if (typeof asset === "string" && asset.endsWith("USDT")) {
      const baseAsset = asset.slice(0, -4);

      if (["BTC", "ETH", "SOL"].includes(baseAsset)) {
        asset = baseAsset as "BTC" | "ETH" | "SOL";
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported asset",
        });
      }
    }

    const currentMarketPriceForThisAsset = PRICESTORE[asset];

    if (!currentMarketPriceForThisAsset) {
      return res.status(400).json({
        success: false,
        message: "Price not available right now",
      });
    }

    // Step 5: Decide price at which user enters game
    const priceAtWhichUserStartsGame =
      type === "BUY"
        ? currentMarketPriceForThisAsset.ask
        : currentMarketPriceForThisAsset.bid;

    // Step 6: Check user has enough money
    if (loggedInUser.balanceUsd < margin) {
      return res.status(400).json({
        success: false,
        message: "Not enough balance",
      });
    }

    await db.$transaction([
      db.user.update({
        where: { id: loggedInUserId },
        data: {
          balanceUsd: { decrement: margin },
          marginUsed: { increment: margin },
        },
      }),

      db.order.create({
        data: {
          userId: loggedInUserId,
          type,
          asset,
          margin,
          leverage,
          openPrice: priceAtWhichUserStartsGame,
        },
      }),
    ]);
    return res.status(201).json({
      success: true,
      message: "Trade opened successfully",
    });
  } catch (error) {
    console.log("Trade open error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function closeTrade(req: Request, res: Response) {
  try {
    const { orderId } = req.body;

    const loggedInUserId = req.userId;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingOrder = await db.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (existingOrder.userId !== loggedInUserId) {
      return res.status(403).json({
        success: false,
        message: "You cannot close this order",
      });
    }

    if (existingOrder.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Order already closed",
      });
    }

    const currentPriceInfo = PRICESTORE[existingOrder.asset];

    if (!currentPriceInfo) {
      return res.status(400).json({
        success: false,
        message: "Price not available",
      });
    }

    const priceAtWhichUserClosesGame =
      existingOrder.type === "BUY"
        ? currentPriceInfo.bid
        : currentPriceInfo.ask;

    const priceDifference =
      priceAtWhichUserClosesGame - existingOrder.openPrice;

    const positionSize = existingOrder.margin * existingOrder.leverage;

    let profitOrLoss = 0;

    if (existingOrder.type === "BUY") {
      profitOrLoss = (priceDifference / existingOrder.openPrice) * positionSize;
    } else {
      profitOrLoss =
        (-priceDifference / existingOrder.openPrice) * positionSize;
    }

    const finalProfitOrLoss = Math.floor(profitOrLoss);

    await db.$transaction([
      db.user.update({
        where: { id: loggedInUserId },
        data: {
          balanceUsd: {
            increment: existingOrder.margin + finalProfitOrLoss,
          },
          marginUsed: {
            decrement: existingOrder.margin,
          },
        },
      }),

      db.order.update({
        where: { id: orderId },
        data: {
          status: "CLOSED",
          closePrice: priceAtWhichUserClosesGame,
          pnl: finalProfitOrLoss,
          closedAt: new Date(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Trade closed successfully",
      pnl: finalProfitOrLoss,
    });
  } catch (error) {
    console.log("Close trade error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
