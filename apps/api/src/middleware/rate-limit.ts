import { Context, Next } from "hono";
import { getRedis } from "../db/redis";

// Constants
const LIMIT_PER_MIN_HEADER = "x-ratelimit-limit";
const REMAINING_PER_MIN_HEADER = "x-ratelimit-remaining";
const RESET_HEADER = "x-ratelimit-reset";
const RETRY_AFTER_HEADER = "retry-after";

const LIMIT_IDENTIFIED = 300; // 300 req/min for header-identified users
const LIMIT_IP_FALLBACK = 60; // 60 req/min for IP fallback users
const WINDOW_SECONDS = 60;

function getLimit(isIpFallback: boolean): number {
  return isIpFallback ? LIMIT_IP_FALLBACK : LIMIT_IDENTIFIED;
}

function getRedisKey(mfId: string): string {
  return `ratelimit:${mfId}`;
}

export async function rateLimitMiddleware(c: Context, next: Next) {
  const mfId = c.get("mfId") as string;
  const isIpFallback = c.get("isIpFallback") as boolean;

  if (!mfId) {
    return c.json({ error: "Missing mfId" }, 400);
  }

  const limit = getLimit(isIpFallback);
  const key = getRedisKey(mfId);

  try {
    const redis = getRedis();

    // Get current count
    const current = await redis.incr(key);

    // Set expiration on first request in window
    if (current === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = Math.floor(Date.now() / 1000) + WINDOW_SECONDS;

    // Add rate limit headers to response
    c.header(LIMIT_PER_MIN_HEADER, String(limit));
    c.header(REMAINING_PER_MIN_HEADER, String(remaining));
    c.header(RESET_HEADER, String(resetTime));

    // Check if limit exceeded
    if (current > limit) {
      return c.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" } },
        429,
        {
          [RETRY_AFTER_HEADER]: String(WINDOW_SECONDS),
        }
      );
    }

    await next();
  } catch (error) {
    // Log but don't fail request on Redis error
    console.error("[RateLimit] Redis error:", error);
    await next();
  }
}
