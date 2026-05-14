import { describe, it, expect, beforeAll } from "vitest";
import { initializeRedis } from "../db/redis";
import { saveSchema, getSchema, listSchemas, deleteSchema } from "./store";
import type { SchemaDefinition } from "@mockforge/types";

const testSchema: SchemaDefinition = {
  name: "TestEntity",
  fields: [
    { name: "title", type: "string" },
    { name: "count", type: "number", min: 0, max: 100 },
  ],
};

describe("Schema Redis Store", () => {
  const mfId = "test-mf-id-store";
  const mfIdOther = "test-mf-id-other";

  beforeAll(() => {
    initializeRedis();
  });

  it("should save and fetch a persistent schema", async () => {
    const slug = await saveSchema(testSchema, mfId, true);
    expect(typeof slug).toBe("string");
    expect(slug.length).toBe(10);

    const fetched = await getSchema(slug);
    expect(fetched).not.toBeNull();
    expect(fetched!.definition.name).toBe("TestEntity");
    expect(fetched!.mfId).toBe(mfId);
    expect(fetched!.persistent).toBe(true);
    expect(fetched!.endpoint).toBe(`/api/custom/${slug}`);
  });

  it("should list schemas for an mfId", async () => {
    const slug = await saveSchema(testSchema, mfId, true);
    const schemas = await listSchemas(mfId);
    expect(schemas.length).toBeGreaterThanOrEqual(1);
    const slugs = schemas.map((s) => s.slug);
    expect(slugs).toContain(slug);
  });

  it("should return empty list for unknown mfId", async () => {
    const schemas = await listSchemas("nonexistent-mf-id");
    expect(Array.isArray(schemas)).toBe(true);
  });

  it("should delete a schema owned by the same mfId", async () => {
    const slug = await saveSchema(testSchema, mfId, true);
    const deleted = await deleteSchema(slug, mfId);
    expect(deleted).toBe(true);

    const fetched = await getSchema(slug);
    expect(fetched).toBeNull();
  });

  it("should not allow delete by a different mfId", async () => {
    const slug = await saveSchema(testSchema, mfId, true);
    const deleted = await deleteSchema(slug, mfIdOther);
    expect(deleted).toBe(false);

    const fetched = await getSchema(slug);
    expect(fetched).not.toBeNull();
  });

  it("should return false when deleting non-existent schema", async () => {
    const deleted = await deleteSchema("nonexistent", mfId);
    expect(deleted).toBe(false);
  });

  it("should return null for non-existent slug", async () => {
    const fetched = await getSchema("nonexistent");
    expect(fetched).toBeNull();
  });

  it("should save an ephemeral schema", async () => {
    const slug = await saveSchema(testSchema, mfId, false);
    const fetched = await getSchema(slug);
    expect(fetched).not.toBeNull();
    expect(fetched!.persistent).toBe(false);
  });
});
