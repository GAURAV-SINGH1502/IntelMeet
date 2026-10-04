import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;

let redisClient = null;

if (redisUrl && redisUrl.trim() !== "") {
  const isTLS = redisUrl.startsWith("rediss://");
  redisClient = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.warn("⚠️ Redis max reconnect attempts reached (3). Disabling auto-reconnect.");
          return false; // Stop reconnecting to prevent infinite crash loops
        }
        return Math.min(retries * 500, 2000);
      },
      ...(isTLS ? { tls: true, rejectUnauthorized: false } : {}),
    },
  });

  redisClient.on("error", (err) => {
    console.warn("⚠️ Redis Error:", err.message || err);
  });

  redisClient.on("connect", () => {
    console.log("🔌 Redis Client Connecting...");
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis Client Ready and Connected");
  });

  redisClient.on("end", () => {
    console.log("ℹ️ Redis Connection Closed");
  });
} else {
  console.log("ℹ️ No REDIS_URL configured, running in cacheless mode.");
}

// Safe helper methods for get, set, del to ensure backend never fails if Redis is down
export const getCache = async (key) => {
  try {
    if (redisClient && redisClient.isOpen) {
      return await redisClient.get(key);
    }
  } catch (err) {
    console.warn(`⚠️ Redis getCache error for key "${key}":`, err.message);
  }
  return null;
};

export const setCache = async (key, value, expireInSeconds = 300) => {
  try {
    if (redisClient && redisClient.isOpen) {
      if (expireInSeconds) {
        await redisClient.set(key, value, { EX: expireInSeconds });
      } else {
        await redisClient.set(key, value);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Redis setCache error for key "${key}":`, err.message);
  }
};

export const delCache = async (key) => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(key);
    }
  } catch (err) {
    console.warn(`⚠️ Redis delCache error for key "${key}":`, err.message);
  }
};

export default redisClient;
