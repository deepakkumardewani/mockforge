import { nanoid } from "nanoid";
import { getRedis } from "../db/redis";
import type { SavedSchema, SchemaDefinition } from "@mockforge/types";

const SLUG_LENGTH = 10;
const EPHEMERAL_TTL = 3600; // 1 hour in seconds

function schemaKey(slug: string): string {
  return `schema:${slug}`;
}

function mfIndexKey(mfId: string): string {
  return `mf:${mfId}:schemas`;
}

export async function saveSchema(
  definition: SchemaDefinition,
  mfId: string,
  persistent: boolean
): Promise<string> {
  const slug = nanoid(SLUG_LENGTH);
  const redis = getRedis();

  const saved: SavedSchema = {
    slug,
    mfId,
    definition,
    persistent,
    endpoint: `/api/custom/${slug}`,
    createdAt: new Date().toISOString(),
  };

  await redis.set(schemaKey(slug), JSON.stringify(saved));

  if (!persistent) {
    await redis.expire(schemaKey(slug), EPHEMERAL_TTL);
  }

  await redis.sadd(mfIndexKey(mfId), slug);

  return slug;
}

export async function getSchema(
  slug: string
): Promise<SavedSchema | null> {
  const redis = getRedis();
  const raw = await redis.get(schemaKey(slug));
  if (!raw) return null;
  return JSON.parse(raw) as SavedSchema;
}

export async function listSchemas(
  mfId: string
): Promise<SavedSchema[]> {
  const redis = getRedis();
  const slugs = await redis.smembers(mfIndexKey(mfId));
  if (slugs.length === 0) return [];

  const schemas: SavedSchema[] = [];
  for (const slug of slugs) {
    const schema = await getSchema(slug);
    if (schema) schemas.push(schema);
  }
  return schemas;
}

export async function deleteSchema(
  slug: string,
  mfId: string
): Promise<boolean> {
  const redis = getRedis();
  const schema = await getSchema(slug);
  if (!schema) return false;
  if (schema.mfId !== mfId) return false;

  await redis.del(schemaKey(slug));
  await redis.srem(mfIndexKey(mfId), slug);
  return true;
}
