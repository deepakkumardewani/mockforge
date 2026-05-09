import { describe, it, expect, beforeEach, vi } from "vitest";

// Store Redis instance separately for testing
let mockRedisInstance: any = null;

// Mock Upstash Redis before importing module
vi.mock("@upstash/redis", () => {
  return {
    Redis: class MockRedis {
      ping() {
        return Promise.resolve("PONG");
      }

      incr(key: string) {
        return Promise.resolve(1);
      }

      get(key: string) {
        return Promise.resolve(null);
      }

      expire(key: string, seconds: number) {
        return Promise.resolve(1);
      }
    },
  };
});

describe("Redis Client", () => {
  beforeEach(() => {
    // Clear module cache to reset singleton
    vi.resetModules();
  });

  it("should initialize Redis without throwing", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { initializeRedis } = await import("../db/redis");

    expect(() => {
      initializeRedis();
    }).not.toThrow();
  });

  it("should throw error if Redis env vars missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    // Re-import to get fresh module
    vi.resetModules();
    const { initializeRedis } = await import("../db/redis");

    expect(() => {
      initializeRedis();
    }).toThrow();
  });

  it("should successfully ping Redis", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    vi.resetModules();
    const { initializeRedis, pingRedis } = await import("../db/redis");

    initializeRedis();
    const result = await pingRedis();

    expect(result).toBe(true);
  });
});
