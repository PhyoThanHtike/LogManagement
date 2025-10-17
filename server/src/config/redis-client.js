import Redis from "ioredis";
import dotenv from 'dotenv';
dotenv.config();

console.log("REDIS_URL exists:", !!process.env.REDIS_URL);
console.log("REDIS_URL value:", process.env.REDIS_URL ? "SET" : "NOT SET");

let redis;

if (process.env.REDIS_URL) {
  console.log("Connecting with REDIS_URL");
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 20000,
    showFriendlyErrorStack: true,
    // ⚠️ make sure TLS is off for non-TLS servers
    tls: undefined,
  });
} else {
  console.log("Connecting with individual credentials");
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD,
    tls: undefined, // disable TLS for non-secure Redis
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 20000,
    showFriendlyErrorStack: true,
  });
}

redis.on("connect", () => {
  console.log("✅ Redis connected successfully (non-TLS)");
});

redis.on("ready", () => {
  console.log("🚀 Redis ready to receive commands");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export { redis };
