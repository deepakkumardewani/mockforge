import { Context, Next } from "hono";
import { getRedis } from "../db/redis";
import {
  RATE_LIMIT_IDENTIFIED,
  RATE_LIMIT_IP_FALLBACK,
  RATE_LIMIT_WINDOW_SECONDS,
} from "../lib/limits";

const LIMIT_PER_MIN_HEADER = "x-ratelimit-limit";
const REMAINING_PER_MIN_HEADER = "x-ratelimit-remaining";
const RESET_HEADER = "x-ratelimit-reset";
const RETRY_AFTER_HEADER = "retry-after";

function getLimit(isIpFallback: boolean): number {
  return isIpFallback ? RATE_LIMIT_IP_FALLBACK : RATE_LIMIT_IDENTIFIED;
}

function getRedisKey(mfId: string): string {
  return `ratelimit:${mfId}`;
}

export async function rateLimitMiddleware(c: Context, next: Next) {
  const mfId = c.get("mfId");
  const isIpFallback = c.get("isIpFallback");

  if (!mfId) {
    return c.json({ error: "Missing mfId" }, 400);
  }

  const limit = getLimit(isIpFallback);
  const key = getRedisKey(mfId);

  try {
    const { count, ttl } = await getRedis().incrFixedWindow(key, RATE_LIMIT_WINDOW_SECONDS);
    const ttlSeconds = ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS;
    const remaining = Math.max(0, limit - count);

    c.header(LIMIT_PER_MIN_HEADER, String(limit));
    c.header(REMAINING_PER_MIN_HEADER, String(remaining));
    c.header(RESET_HEADER, String(Math.floor(Date.now() / 1000) + ttlSeconds));

    if (count > limit) {
      return c.json({ error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" } }, 429, {
        [RETRY_AFTER_HEADER]: String(ttlSeconds),
      });
    }

    await next();
  } catch (error) {
    console.error("[RateLimit] Redis error:", error);
    await next();
  }
}
