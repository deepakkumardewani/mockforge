import { beforeEach, describe, expect, it, vi } from "vitest";

type MockRedis = {
  ping: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  setex: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
  incr: ReturnType<typeof vi.fn>;
  sadd: ReturnType<typeof vi.fn>;
  srem: ReturnType<typeof vi.fn>;
  smembers: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
  keys: ReturnType<typeof vi.fn>;
};

const last = {
  upstash: null as MockRedis | null,
  ioredis: null as MockRedis | null,
};

function createMockRedis(): MockRedis {
  return {
    ping: vi.fn().mockResolvedValue("PONG"),
    get: vi.fn().mockResolvedValue("cached"),
    set: vi.fn().mockResolvedValue("OK"),
    setex: vi.fn().mockResolvedValue("OK"),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(42),
    del: vi.fn().mockResolvedValue(2),
    incr: vi.fn().mockResolvedValue(7),
    sadd: vi.fn().mockResolvedValue(2),
    srem: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue(["a", "b"]),
    exists: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue(["k1"]),
  };
}

const UpstashRedis = vi.fn(function MockUpstashRedis() {
  last.upstash = createMockRedis();
  return last.upstash;
});

const IORedis = vi.fn(function MockIORedis() {
  last.ioredis = createMockRedis();
  return last.ioredis;
});

vi.mock("@upstash/redis", () => ({
  Redis: UpstashRedis,
}));

vi.mock("ioredis", () => ({
  default: IORedis,
}));

type RedisModule = typeof import("../db/redis");

async function loadRedis(): Promise<RedisModule> {
  vi.resetModules();
  last.upstash = null;
  last.ioredis = null;
  UpstashRedis.mockClear();
  IORedis.mockClear();
  return import("../db/redis");
}

function setProductionUpstashEnv() {
  delete process.env.REDIS_LOCAL;
  process.env.NODE_ENV = "production";
  process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
}

function setLocalRedisEnv() {
  process.env.REDIS_LOCAL = "true";
  process.env.NODE_ENV = "production";
}

async function exerciseClient(client: ReturnType<RedisModule["initializeRedis"]>) {
  await expect(client.ping()).resolves.toBe("PONG");
  await expect(client.get("k")).resolves.toBeDefined();
  await client.set("k", "v");
  await client.set("k", "v", "EX", 60);
  await client.setex("k", 30, "v");
  await client.expire("k", 10);
  await client.ttl("k");
  await client.del("a", "b");
  await client.incr("counter");
  await client.sadd("set", "m1", "m2");
  await client.srem("set", "m1", "m2");
  await client.smembers("set");
  await client.exists("a", "b");
  await client.keys("prefix:*");
}

describe("Redis adapters via initializeRedis", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
    delete process.env.REDIS_LOCAL;
  });

  it("throws from getRedis before initializeRedis", async () => {
    setProductionUpstashEnv();
    const { getRedis } = await loadRedis();
    expect(() => getRedis()).toThrow("Redis not initialized. Call initializeRedis() first.");
  });

  it("reuses the singleton from initializeRedis", async () => {
    setLocalRedisEnv();
    const { initializeRedis } = await loadRedis();
    const first = initializeRedis();
    const second = initializeRedis();
    expect(second).toBe(first);
    expect(IORedis).toHaveBeenCalledTimes(1);
  });

  it("returns false from pingRedis when ping throws", async () => {
    setLocalRedisEnv();
    const { initializeRedis, pingRedis } = await loadRedis();
    initializeRedis();
    last.ioredis!.ping.mockRejectedValueOnce(new Error("down"));
    await expect(pingRedis()).resolves.toBe(false);
  });

  it("returns false from pingRedis when ping is not PONG", async () => {
    setLocalRedisEnv();
    const { initializeRedis, pingRedis } = await loadRedis();
    initializeRedis();
    last.ioredis!.ping.mockResolvedValueOnce("NOPE");
    await expect(pingRedis()).resolves.toBe(false);
  });

  it("wraps every UpstashAdapter method in production", async () => {
    setProductionUpstashEnv();
    const { initializeRedis, getRedis } = await loadRedis();
    const client = initializeRedis();
    expect(getRedis()).toBe(client);
    expect(UpstashRedis).toHaveBeenCalledWith({
      url: "https://test.upstash.io",
      token: "test-token",
    });

    last.upstash!.get.mockResolvedValueOnce(undefined);
    await expect(client.get("missing")).resolves.toBeNull();

    last.upstash!.get.mockResolvedValueOnce("hit");
    await expect(client.get("present")).resolves.toBe("hit");

    await exerciseClient(client);

    expect(last.upstash!.set).toHaveBeenCalledWith("k", "v");
    expect(last.upstash!.set).toHaveBeenCalledWith("k", "v", { ex: 60 });
    expect(last.upstash!.set).toHaveBeenCalledWith("k", "v", { ex: 30 });
    expect(last.upstash!.del).toHaveBeenCalledWith("a", "b");
    expect(last.upstash!.sadd).toHaveBeenCalledWith("set", "m1", "m2");
    expect(last.upstash!.srem).toHaveBeenCalledWith("set", "m1", "m2");
    expect(last.upstash!.exists).toHaveBeenCalledWith("a", "b");
  });

  it("wraps every IoRedisAdapter method when REDIS_LOCAL=true", async () => {
    setLocalRedisEnv();
    delete process.env.REDIS_URL;
    const { initializeRedis, getRedis } = await loadRedis();
    const client = initializeRedis();
    expect(getRedis()).toBe(client);
    expect(IORedis).toHaveBeenCalledWith("redis://localhost:6379", { lazyConnect: false });

    await exerciseClient(client);

    expect(last.ioredis!.set).toHaveBeenCalledWith("k", "v");
    expect(last.ioredis!.set).toHaveBeenCalledWith("k", "v", "EX", 60);
    expect(last.ioredis!.setex).toHaveBeenCalledWith("k", 30, "v");
    expect(last.ioredis!.del).toHaveBeenCalledWith("a", "b");
    expect(last.ioredis!.sadd).toHaveBeenCalledWith("set", "m1", "m2");
    expect(last.ioredis!.srem).toHaveBeenCalledWith("set", "m1", "m2");
    expect(last.ioredis!.exists).toHaveBeenCalledWith("a", "b");
    expect(last.ioredis!.keys).toHaveBeenCalledWith("prefix:*");
  });

  it("uses REDIS_URL for the local adapter", async () => {
    setLocalRedisEnv();
    process.env.REDIS_URL = "redis://custom:6379";
    const { initializeRedis } = await loadRedis();
    initializeRedis();
    expect(IORedis).toHaveBeenCalledWith("redis://custom:6379", { lazyConnect: false });
  });

  it("uses the local adapter when NODE_ENV is development", async () => {
    delete process.env.REDIS_LOCAL;
    process.env.NODE_ENV = "development";
    const { initializeRedis } = await loadRedis();
    initializeRedis();
    expect(IORedis).toHaveBeenCalledTimes(1);
    expect(UpstashRedis).not.toHaveBeenCalled();
  });
});
