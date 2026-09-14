import { nanoid } from "nanoid";
import { getRedis, type RedisClient } from "../db/redis";
import { EPHEMERAL_SCHEMA_TTL_SECONDS } from "../lib/limits";
import type { SavedSchema, SchemaDefinition } from "@mockforge/types";

const SLUG_LENGTH = 10;
const REDIS_SET_EX = "EX";

function schemaKey(slug: string): string {
  return `schema:${slug}`;
}

function persistentIndexKey(mfId: string): string {
  return `mf:${mfId}:schemas`;
}

function ephemeralIndexKey(mfId: string): string {
  return `mf:${mfId}:ephemeral`;
}

async function writeSavedSchema(saved: SavedSchema): Promise<void> {
  const redis = getRedis();
  const key = schemaKey(saved.slug);
  const payload = JSON.stringify(saved);

  if (saved.persistent) {
    await redis.set(key, payload);
    return;
  }

  await redis.set(key, payload, REDIS_SET_EX, EPHEMERAL_SCHEMA_TTL_SECONDS);
}

async function ensureEphemeralIndexTtl(redis: RedisClient, mfId: string): Promise<void> {
  const key = ephemeralIndexKey(mfId);
  const ttl = await redis.ttl(key);
  if (ttl < EPHEMERAL_SCHEMA_TTL_SECONDS) {
    await redis.expire(key, EPHEMERAL_SCHEMA_TTL_SECONDS);
  }
}

async function indexSchema(mfId: string, slug: string, persistent: boolean): Promise<void> {
  const redis = getRedis();
  if (persistent) {
    await redis.sadd(persistentIndexKey(mfId), slug);
    await redis.srem(ephemeralIndexKey(mfId), slug);
    return;
  }

  await redis.sadd(ephemeralIndexKey(mfId), slug);
  await redis.srem(persistentIndexKey(mfId), slug);
  await ensureEphemeralIndexTtl(redis, mfId);
}

export async function saveSchema(
  definition: SchemaDefinition,
  mfId: string,
  persistent: boolean,
): Promise<string> {
  const slug = nanoid(SLUG_LENGTH);

  const saved: SavedSchema = {
    slug,
    mfId,
    definition,
    persistent,
    endpoint: `/api/custom/${slug}`,
    createdAt: new Date().toISOString(),
  };

  await writeSavedSchema(saved);
  await indexSchema(mfId, slug, persistent);
  return slug;
}

export async function getSchema(slug: string): Promise<SavedSchema | null> {
  const redis = getRedis();
  const raw = await redis.get(schemaKey(slug));
  if (!raw) return null;
  return JSON.parse(raw) as SavedSchema;
}

export async function updateSchema(
  slug: string,
  definition: SchemaDefinition,
  mfId: string,
  persistent?: boolean,
): Promise<SavedSchema | null> {
  const existing = await getSchema(slug);
  if (!existing || existing.mfId !== mfId) return null;

  const nextPersistent = persistent ?? existing.persistent;
  const saved: SavedSchema = {
    ...existing,
    slug: existing.slug,
    definition,
    persistent: nextPersistent,
    endpoint: `/api/custom/${existing.slug}`,
  };

  await writeSavedSchema(saved);
  await indexSchema(mfId, existing.slug, nextPersistent);
  return saved;
}

async function pruneIndexMembers(
  redis: RedisClient,
  key: string,
  members: string[],
): Promise<void> {
  if (members.length === 0) return;
  try {
    await redis.srem(key, ...members);
  } catch (error) {
    console.error("[SchemaStore] Failed to prune stale index members:", error);
  }
}

export async function listSchemas(mfId: string): Promise<SavedSchema[]> {
  const redis = getRedis();
  const persistKey = persistentIndexKey(mfId);
  const ephemeralKey = ephemeralIndexKey(mfId);
  const [persistentSlugs, ephemeralSlugs] = await Promise.all([
    redis.smembers(persistKey),
    redis.smembers(ephemeralKey),
  ]);

  const slugs = [...new Set([...persistentSlugs, ...ephemeralSlugs])];
  if (slugs.length === 0) return [];

  const values = await Promise.all(slugs.map((slug) => redis.get(schemaKey(slug))));
  const schemas: SavedSchema[] = [];
  const stalePersistent: string[] = [];
  const staleEphemeral: string[] = [];
  const persistentMembers = new Set(persistentSlugs);
  const ephemeralMembers = new Set(ephemeralSlugs);

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const raw = values[i];
    if (!raw) {
      if (persistentMembers.has(slug)) stalePersistent.push(slug);
      if (ephemeralMembers.has(slug)) staleEphemeral.push(slug);
      continue;
    }
    schemas.push(JSON.parse(raw) as SavedSchema);
  }

  await Promise.all([
    pruneIndexMembers(redis, persistKey, stalePersistent),
    pruneIndexMembers(redis, ephemeralKey, staleEphemeral),
  ]);

  return schemas;
}

export async function deleteSchema(slug: string, mfId: string): Promise<boolean> {
  const redis = getRedis();
  const schema = await getSchema(slug);
  if (!schema) return false;
  if (schema.mfId !== mfId) return false;

  await redis.del(schemaKey(slug));
  await redis.srem(persistentIndexKey(mfId), slug);
  await redis.srem(ephemeralIndexKey(mfId), slug);
  return true;
}
