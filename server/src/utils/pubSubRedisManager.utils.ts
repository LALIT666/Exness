import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";

export class RedisConnectionManager {
  private static singleInstance: RedisConnectionManager;

  private clientUsedForPublishingMessages: RedisClientType;
  private clientUsedForSubscribingMessages: RedisClientType;

  private constructor() {
    const redisServerUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

    this.clientUsedForPublishingMessages = createClient({
      url: redisServerUrl,
    });

    this.clientUsedForSubscribingMessages = createClient({
      url: redisServerUrl,
    });
  }

  // ✅ This ensures only one Redis manager exists in whole app
  static async getSingleInstance() {
    if (!RedisConnectionManager.singleInstance) {
      const manager = new RedisConnectionManager();
      await manager.connectBothRedisClients();
      RedisConnectionManager.singleInstance = manager;
    }

    return RedisConnectionManager.singleInstance;
  }

  // ✅ Connect both publish & subscribe clients
  private async connectBothRedisClients() {
    await this.clientUsedForPublishingMessages.connect();
    await this.clientUsedForSubscribingMessages.connect();
  }

  // ✅ Send message to a channel
  async sendMessageToChannel(channelName: string, messageObject: any) {
    const messageInStringFormat = JSON.stringify(messageObject);

    await this.clientUsedForPublishingMessages.publish(
      channelName,
      messageInStringFormat,
    );
  }

  // ✅ Listen to messages from a channel
  async listenToChannelMessages(
    channelName: string,
    functionToRunWhenMessageArrives: (message: string) => void,
  ) {
    await this.clientUsedForSubscribingMessages.subscribe(
      channelName,
      (incomingMessage) => {
        functionToRunWhenMessageArrives(incomingMessage);
      },
    );
  }

  // ✅ Disconnect both clients
  async closeRedisConnections() {
    this.clientUsedForPublishingMessages.destroy();
    this.clientUsedForSubscribingMessages.destroy();
  }
}
