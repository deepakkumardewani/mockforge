import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

// Minimal interface covering every method used across the codebase
export interface RedisClient {
  ping(): Promise<string>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
  setex(key: string, seconds: number, value: string): Promise<unknown>;
  expire(key: string, seconds: number): Promise<unknown>;
  ttl(key: string): Promise<number>;
  del(...keys: string[]): Promise<unknown>;
  incr(key: string): Promise<number>;
  sadd(key: string, ...members: string[]): Promise<unknown>;
  srem(key: string, ...members: string[]): Promise<unknown>;
  smembers(key: string): Promise<string[]>;
  exists(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
}

// Wraps Upstash REST client to match RedisClient interface
class UpstashAdapter implements RedisClient {
  constructor(private client: UpstashRedis) {}

  async ping() {
    const r = await this.client.ping();
    return r as string;
  }
  async get(key: string) {
    const v = await this.client.get<string>(key);
    return v ?? null;
  }
  // Upstash set accepts (key, value, opts?) — normalise varargs
  async set(key: string, value: string, ...args: unknown[]) {
    if (args.length === 2 && args[0] === "EX") {
      return this.client.set(key, value, { ex: args[1] as number });
    }
    return this.client.set(key, value);
  }
  async setex(key: string, seconds: number, value: string) {
    return this.client.set(key, value, { ex: seconds });
  }
  async expire(key: string, seconds: number) {
    return this.client.expire(key, seconds);
  }
  async ttl(key: string) {
    return this.client.ttl(key);
  }
  async del(...keys: string[]) {
    return this.client.del(keys[0], ...keys.slice(1));
  }
  async incr(key: string) {
    return this.client.incr(key);
  }
  async sadd(key: string, ...members: string[]) {
    return this.client.sadd(key, members[0], ...members.slice(1));
  }
  async srem(key: string, ...members: string[]) {
    return this.client.srem(key, members[0], ...members.slice(1));
  }
  async smembers(key: string) {
    return this.client.smembers(key);
  }
  async exists(...keys: string[]) {
    return this.client.exists(keys[0], ...keys.slice(1));
  }
  async keys(pattern: string) {
    return this.client.keys(pattern);
  }
}

// Wraps ioredis to match RedisClient interface
class IoRedisAdapter implements RedisClient {
  constructor(private client: IORedis) {}

  async ping() {
    return this.client.ping();
  }
  async get(key: string) {
    return this.client.get(key);
  }
  async set(key: string, value: string, ...args: unknown[]) {
    if (args.length === 2 && args[0] === "EX") {
      return this.client.set(key, value, "EX", args[1] as number);
    }
    return this.client.set(key, value);
  }
  async setex(key: string, seconds: number, value: string) {
    return this.client.setex(key, seconds, value);
  }
  async expire(key: string, seconds: number) {
    return this.client.expire(key, seconds);
  }
  async ttl(key: string) {
    return this.client.ttl(key);
  }
  async del(...keys: string[]) {
    return this.client.del(...keys);
  }
  async incr(key: string) {
    return this.client.incr(key);
  }
  async sadd(key: string, ...members: string[]) {
    return this.client.sadd(key, ...members);
  }
  async srem(key: string, ...members: string[]) {
    return this.client.srem(key, ...members);
  }
  async smembers(key: string) {
    return this.client.smembers(key);
  }
  async exists(...keys: string[]) {
    return this.client.exists(...keys);
  }
  async keys(pattern: string) {
    return this.client.keys(pattern);
  }
}

let redisInstance: RedisClient | null = null;

export function initializeRedis(): RedisClient {
  if (redisInstance) return redisInstance;

  const isLocal =
    process.env.REDIS_LOCAL === "true" ||
    process.env.NODE_ENV === "development";

  if (isLocal) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    const io = new IORedis(url, { lazyConnect: false });
    redisInstance = new IoRedisAdapter(io);
  } else {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Production Redis config missing: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
      );
    }
    redisInstance = new UpstashAdapter(new UpstashRedis({ url, token }));
  }

  return redisInstance;
}

export function getRedis(): RedisClient {
  if (!redisInstance) {
    throw new Error("Redis not initialized. Call initializeRedis() first.");
  }
  return redisInstance;
}

export async function pingRedis(): Promise<boolean> {
  try {
    const result = await getRedis().ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
