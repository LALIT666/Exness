import type { Request, Response } from "express";
import db from "../db/db";

export async function usersOpenTrades(req: Request, res: Response) {
  try {
    const loggedInUserId = req.userId;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const openTradesOfUser = await db.order.findMany({
      where: {
        userId: loggedInUserId,
        status: "OPEN",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        asset: true,
        margin: true,
        leverage: true,
        openPrice: true,
        takeProfit: true,
        stopLoss: true,
        liquidationPrice: true,
        createdAt: true,
      },
    });

    const formattedTrades = openTradesOfUser.map((order) => ({
      orderId: order.id,
      type: order.type,
      asset: order.asset,
      margin: order.margin,
      leverage: order.leverage,
      openPrice: order.openPrice,
      takeProfit: order.takeProfit,
      stopLoss: order.stopLoss,
      liquidationPrice: order.liquidationPrice,
      createdAt: order.createdAt,
    }));

    return res.status(200).json({
      success: true,
      trades: formattedTrades,
    });
  } catch (error) {
    console.log("Error fetching open trades:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function usersClosedTrades(req: Request, res: Response) {
  try {
    const loggedInUserId = req.userId;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const closedTradesOfUsers = await db.order.findMany({
      where: {
        userId: loggedInUserId,
        status: "CLOSED",
      },
      orderBy: {
        closedAt: "desc",
      },
      select: {
        id: true,
        type: true,
        asset: true,
        margin: true,
        leverage: true,
        openPrice: true,
        closePrice: true,
        pnl: true,
        closedAt: true,
      },
    });

    const formattedTrades = closedTradesOfUsers.map((order) => ({
      orderId: order.id,
      type: order.type,
      asset: order.asset,
      margin: order.margin,
      leverage: order.leverage,
      openPrice: order.openPrice,
      closePrice: order.closePrice,
      pnl: order.pnl,
      closedAt: order.closedAt,
    }));

    return res.status(200).json({
      success: true,
      trades: formattedTrades,
    });
  } catch (error) {
    console.error("Error fetching closed trades:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
