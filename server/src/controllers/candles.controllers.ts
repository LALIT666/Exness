import type { Request, Response } from "express";
import db from "../db/db";

export async function getCandles(req: Request, res: Response) {
  try {
    const timeDuration = req.query.ts as string;
    const selectedAsset = req.query.asset as string;
    const startTimestamp = req.query.startTime as string;
    const endTimestamp = req.query.endTime as string;

    if (!timeDuration || !selectedAsset || !startTimestamp || !endTimestamp) {
      return res.status(400).json({
        success: false,
        message: "Missing query parameters",
      });
    }

    const tradingSymbol =
      selectedAsset === "BTC"
        ? "BTCUSDT"
        : selectedAsset === "ETH"
          ? "ETHUSDT"
          : selectedAsset === "SOL"
            ? "SOLUSDT"
            : null;

    if (!tradingSymbol) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset",
      });
    }

    const startDate = new Date(Number(startTimestamp) * 1000);
    const endDate = new Date(Number(endTimestamp) * 1000);

    const candlesFromDatabase = await db.candle.findMany({
      where: {
        symbol: tradingSymbol,
        interval: timeDuration,
        bucket: {
          gte: startDate, //greater than equal to
          lte: endDate, //less than equal to
        },
      },
      orderBy: {
        bucket: "asc",
      },
    });

    const formattedCandles = candlesFromDatabase.map((row) => ({
      timestamp: Math.floor(new Date(row.bucket).getTime() / 1000),
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      decimal: 4,
    }));

    return res.status(200).json({
      success: true,
      candles: formattedCandles,
    });
  } catch (error) {
    console.error("Error fetching candles:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
