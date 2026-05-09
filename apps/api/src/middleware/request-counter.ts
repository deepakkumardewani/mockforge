import { Context, Next } from "hono";
import { getRedis } from "../db/redis";

const STATS_KEY = "stats:total_requests";

export async function requestCounterMiddleware(c: Context, next: Next) {
  await next();

  // Only count 2xx responses
  const status = c.res.status;
  if (status >= 200 && status < 300) {
    // Fire and forget - don't await
    (async () => {
      try {
        const redis = getRedis();
        await redis.incr(STATS_KEY);
      } catch (error) {
        console.error("[RequestCounter] Failed to increment counter:", error);
      }
    })();
  }
}
