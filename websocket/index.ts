import { createClient } from "redis";

import { WebSocket, WebSocketServer } from "ws";

const redisClientUsedToReceiveMarketUpdates = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

const webSocketServerForClients = new WebSocketServer({ port: 8080 });

const connectedClientsAndTheirSubscribedAssets = new Map<
  WebSocket,
  Set<string>
>();

export const supportedAssetChannels = ["SOL", "ETH", "BTC"];

const startWebSocketAndRedisSystem = async () => {
  await redisClientUsedToReceiveMarketUpdates.connect();

  //haar asset channel par kaan lagao
  supportedAssetChannels.forEach((assetChannelName) => {
    //Har channel ("SOL", "ETH", "BTC") pe subscribe kar diya. Jab bhi kisi bhi channel pe message aayega, (incomingMarketData) => { ... } callback chalega.

    redisClientUsedToReceiveMarketUpdates.subscribe(
      assetChannelName,
      (incomingMarketData) => {
        connectedClientsAndTheirSubscribedAssets.forEach(
          (assetsClientIsListeningTo, webSocketConnection) => {
            if (assetsClientIsListeningTo.has(assetChannelName)) {
              //Dekha ki kya set me asset name hai ya phir aisa bhi bol sakatae ho ki kya client ko wo particular asset chaiya ya nahi agar ha toh wesocketconnection se bhej do jo bhi incoming data hai usko
              if (webSocketConnection.readyState === WebSocket.OPEN) {
                webSocketConnection.send(incomingMarketData);
              }
            }
          },
        );
      },
    );
  });

  webSocketServerForClients.on(
    "connection",
    (webSocketConnection: WebSocket) => {
      connectedClientsAndTheirSubscribedAssets.set(
        webSocketConnection,
        new Set(),
      );

      webSocketConnection.on("message", (rawMessage) => {
        const parseMessage = JSON.parse(rawMessage.toString());

        if (
          parseMessage.type === "SUBSCRIBE" &&
          supportedAssetChannels.includes(parseMessage.symbol)
        ) {
          const assetSymbolClientWantsToListen = parseMessage.symbol;

          const currentSubscriptions =
            connectedClientsAndTheirSubscribedAssets.get(webSocketConnection);

          currentSubscriptions?.add(assetSymbolClientWantsToListen);
        }

        if (parseMessage.type === "UNSUBSCRIBE") {
          const assetSymbolClientWantsToStopListening = parseMessage.symbol;

          const currentSubscriptions =
            connectedClientsAndTheirSubscribedAssets.get(webSocketConnection);

          currentSubscriptions?.delete(assetSymbolClientWantsToStopListening);

          if (currentSubscriptions?.size === 0) {
            connectedClientsAndTheirSubscribedAssets.delete(
              webSocketConnection,
            );
          }
        }
      });

      webSocketConnection.on("close", () => {
        connectedClientsAndTheirSubscribedAssets.delete(webSocketConnection);
        console.log("Client disconnected");
      });
    },
  );
};

startWebSocketAndRedisSystem().catch(console.error);
