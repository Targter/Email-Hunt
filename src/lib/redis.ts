// import Redis from "ioredis";

// const redisUrl = process.env.REDIS_URL;

// if (!redisUrl) {
//   throw new Error("REDIS_URL is not defined in environment variables");
// }

// // Configuration optimized for Upstash
// export const redisConnection = new Redis(redisUrl, {
//   maxRetriesPerRequest: null, // Required by BullMQ
//   tls: {
//     rejectUnauthorized: false, // Required for most serverless Redis providers
//   },
//   connectTimeout: 10000,
// });

// redisConnection.on("error", (err) => {
//   console.error("Redis Connection Error:", err);
// });

// 
import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Redis keys missing from .env");
}


export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// cache: "no-store", 