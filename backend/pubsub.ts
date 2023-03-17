import {RedisPubSub} from 'graphql-redis-subscriptions'
const Redis = require("ioredis");

// =========== START REDIS STUFF =========== //
const redisOptions = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || "6379",
    password: process.env.REDIS_PASSWORD || "",
    tls: true,
    retryStrategy: (times: any) => {
      return Math.min(times * 50, 2000);
    },
};
export const pubsub = new RedisPubSub({
    publisher: new Redis(redisOptions as any),
    subscriber: new Redis(redisOptions as any),
});