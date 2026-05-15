import { WebSocket } from "ws";
import { createClient } from "redis";
import dotenv from "dotenv";

import prisma from "./db";
import { pushToRedis } from "./redisops";
import { toInternalPrice } from "./utils";
import { saveTradeBatch } from "./dbops";

dotenv.config();

// ✅ Batch settings
const BATCH_INTERVAL_MS = 10000; // 10 seconds
let tradeBatch: any[] = [];

async function main() {
  try {
    // ✅ 1. Connect Redis
    const redis = createClient({
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
    });

    await redis.connect();
    console.log("✅ Redis connected");

    // ✅ 2. Batch saver (every 10 sec DB save)
    setInterval(async () => {
      if (!tradeBatch.length) return;

      const batchToSave = [...tradeBatch];
      tradeBatch = [];

      await saveTradeBatch(batchToSave);
    }, BATCH_INTERVAL_MS);

    // ✅ 3. Connect to Binance WebSocket
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");

    ws.on("open", () => {
      console.log("✅ Connected to Binance WebSocket");

      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: ["btcusdt@aggTrade", "ethusdt@aggTrade", "solusdt@aggTrade"],
          id: 1,
        }),
      );
    });

    // ✅ 4. Handle incoming trade messages
    ws.on("message", async (rawData: WebSocket.RawData) => {
      const message = JSON.parse(rawData.toString());

      if (message.e === "aggTrade") {
        // ✅ Convert to internal price format
        const intPrice = toInternalPrice(message.p);
        const intQty = toInternalPrice(message.q);

        // ✅ Publish to Redis (for WebSocket server)
        pushToRedis(redis, intPrice, message.s, new Date(message.T));

        // ✅ Add to batch for DB saving
        tradeBatch.push({
          symbol: message.s,
          tradeId: BigInt(message.a),
          price: BigInt(intPrice),
          quantity: BigInt(intQty),
          timestamp: new Date(message.T),
        });
      }
    });

    ws.on("error", (err) => {
      console.error("❌ Binance WebSocket error:", err);
    });

    ws.on("close", async () => {
      console.log("⚠ Binance WebSocket closed");

      // Save remaining trades
      if (tradeBatch.length) {
        await saveTradeBatch(tradeBatch);
      }

      await redis.quit();
      await prisma.$disconnect();
    });
  } catch (error) {
    console.error("❌ Error in price pulse service:", error);
  }
}

main();
