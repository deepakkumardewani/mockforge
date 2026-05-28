import { Hono } from "hono";
import { getRedis } from "../db/redis";

const app = new Hono();

app.get("/api/stats", async (c) => {
  try {
    const redis = getRedis();
    const raw = await redis.get("stats:total_requests");
    const total = raw !== null ? Number(raw) : 0;

    return c.json({
      total,
      nodeEnv: process.env.NODE_ENV,
      redisLocal: process.env.REDIS_LOCAL,
      redisUrl: process.env.REDIS_URL,
      upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    });
  } catch (error) {
    console.error("[Stats] Error fetching stats:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch stats",
        },
      },
      500,
    );
  }
});

export default app;
