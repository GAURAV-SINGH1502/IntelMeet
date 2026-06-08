import { createClient } from "redis";



const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

export default redisClient;
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

