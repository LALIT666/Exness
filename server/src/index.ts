import express from "express";
import db from "./db/db";
import cors from "cors";
import path from "path";

//All routers
import userRoutes from "./routes/user.routes";
import { tradeRouter } from "./routes/trade.routes";
import { tradesRouter } from "./routes/trades.routes";
import { candelRouter } from "./routes/candles.routes";
import { assetRouter } from "./routes/assest.routes";

import { RedisConnectionManager } from "./utils/pubSubRedisManager.utils";
import { PRICESTORE } from "./store/price.store";
import { checkAndAutoCloseTradesForAsset } from "./service/checkAndAutoCloseTradesForAsset.service";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "../public/images")));

const PORT = Number(process.env.PORT) || 3000;

app.get("/api/v1/health", (req, res) => {
  res.json({
    ok: true,
    service: "server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/trades", tradeRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/candles", candelRouter);
app.use("/api/v1/asset", assetRouter);

async function startListeningToPrices() {
  const redisManager = await RedisConnectionManager.getSingleInstance();

  const assets = ["BTC", "ETH", "SOL"] as const;

  for (const asset of assets) {
    await redisManager.listenToChannelMessages(
      asset,
      async (incomingMessage: string) => {
        const parsedData = JSON.parse(incomingMessage);

        const latestBid = parsedData.bidPrice;
        const latestAsk = parsedData.askPrice;

        // ✅ 1. Update price store
        PRICESTORE[asset] = {
          bid: latestBid,
          ask: latestAsk,
        };

        console.log(`Updated price for ${asset}`, PRICESTORE[asset]);

        // ✅ 2. Check open trades
        await checkAndAutoCloseTradesForAsset(asset, {
          bid: latestBid,
          ask: latestAsk,
        });
      },
    );
  }
}

async function connect() {
  try {
    await db.$connect();
    console.log("✅ Database connected");

    // ✅ Start Redis Price Listener
    await startListeningToPrices();
    console.log("✅ Redis price listener started");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Connection to db failed", error);
    process.exit(1);
  }
}

connect();
