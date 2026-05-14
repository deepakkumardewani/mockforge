import { Hono } from "hono";
import { getRedis } from "../db/redis";

const app = new Hono();

app.get("/api/stats", async (c) => {
  try {
    const redis = getRedis();
    const total = await redis.get("stats:total_requests");

    return c.json({
      total: typeof total === "number" ? total : 0,
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
