import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SchemaDefinition } from "@mockforge/types";

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockExpire = vi.fn();
const mockSadd = vi.fn();
const mockSmembers = vi.fn();
const mockDel = vi.fn();
const mockSrem = vi.fn();

vi.mock("../db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
    set: mockSet,
    expire: mockExpire,
    sadd: mockSadd,
    smembers: mockSmembers,
    del: mockDel,
    srem: mockSrem,
  }),
}));

import { saveSchema, getSchema, updateSchema, listSchemas, deleteSchema } from "./store";

const definition: SchemaDefinition = {
  name: "Widget",
  fields: [{ name: "title", type: "string" }],
};

function savedSchema(overrides: Record<string, unknown> = {}) {
  return {
    slug: "abc123defg",
    mfId: "owner-1",
    definition,
    persistent: true,
    endpoint: "/api/custom/abc123defg",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("schema store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveSchema", () => {
    it("persists without expire when persistent is true", async () => {
      mockSet.mockResolvedValueOnce("OK");
      mockSadd.mockResolvedValueOnce(1);

      const slug = await saveSchema(definition, "owner-1", true);

      expect(slug).toHaveLength(10);
      expect(mockSet).toHaveBeenCalledWith(
        `schema:${slug}`,
        expect.stringContaining('"persistent":true'),
      );
      expect(mockExpire).not.toHaveBeenCalled();
      expect(mockSadd).toHaveBeenCalledWith("mf:owner-1:schemas", slug);
    });

    it("sets a 1-hour TTL when persistent is false", async () => {
      mockSet.mockResolvedValueOnce("OK");
      mockExpire.mockResolvedValueOnce(1);
      mockSadd.mockResolvedValueOnce(1);

      const slug = await saveSchema(definition, "owner-1", false);

      expect(mockExpire).toHaveBeenCalledWith(`schema:${slug}`, 3600);
    });

    it("rejects when Redis set fails", async () => {
      mockSet.mockRejectedValueOnce(new Error("redis write failed"));

      await expect(saveSchema(definition, "owner-1", true)).rejects.toThrow("redis write failed");
    });
  });

  describe("getSchema", () => {
    it("returns null when the key is missing", async () => {
      mockGet.mockResolvedValueOnce(null);

      await expect(getSchema("missing")).resolves.toBeNull();
    });

    it("parses a stored schema", async () => {
      const stored = savedSchema();
      mockGet.mockResolvedValueOnce(JSON.stringify(stored));

      await expect(getSchema(stored.slug)).resolves.toEqual(stored);
    });

    it("rejects when Redis get fails", async () => {
      mockGet.mockRejectedValueOnce(new Error("redis read failed"));

      await expect(getSchema("abc123defg")).rejects.toThrow("redis read failed");
    });
  });

  describe("updateSchema", () => {
    const nextDefinition: SchemaDefinition = {
      name: "Gadget",
      fields: [{ name: "sku", type: "string" }],
    };

    it("returns null when the schema is missing", async () => {
      mockGet.mockResolvedValueOnce(null);

      await expect(updateSchema("missing", nextDefinition, "owner-1")).resolves.toBeNull();
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("returns null when mfId does not match", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema()));

      await expect(updateSchema("abc123defg", nextDefinition, "other-owner")).resolves.toBeNull();
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("updates definition and keeps persistent without expire", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema()));
      mockSet.mockResolvedValueOnce("OK");
      mockSadd.mockResolvedValueOnce(1);

      const updated = await updateSchema("abc123defg", nextDefinition, "owner-1", true);

      expect(updated?.definition).toEqual(nextDefinition);
      expect(updated?.persistent).toBe(true);
      expect(mockExpire).not.toHaveBeenCalled();
      expect(mockSadd).toHaveBeenCalledWith("mf:owner-1:schemas", "abc123defg");
    });

    it("applies expire when next persistent flag is false", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema({ persistent: true })));
      mockSet.mockResolvedValueOnce("OK");
      mockExpire.mockResolvedValueOnce(1);
      mockSadd.mockResolvedValueOnce(1);

      const updated = await updateSchema("abc123defg", nextDefinition, "owner-1", false);

      expect(updated?.persistent).toBe(false);
      expect(mockExpire).toHaveBeenCalledWith("schema:abc123defg", 3600);
    });

    it("keeps existing persistent when the flag is omitted", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema({ persistent: false })));
      mockSet.mockResolvedValueOnce("OK");
      mockExpire.mockResolvedValueOnce(1);
      mockSadd.mockResolvedValueOnce(1);

      const updated = await updateSchema("abc123defg", nextDefinition, "owner-1");

      expect(updated?.persistent).toBe(false);
      expect(mockExpire).toHaveBeenCalledWith("schema:abc123defg", 3600);
    });
  });

  describe("listSchemas", () => {
    it("returns an empty array when the index is empty", async () => {
      mockSmembers.mockResolvedValueOnce([]);

      await expect(listSchemas("owner-1")).resolves.toEqual([]);
    });

    it("skips stale slugs that no longer resolve", async () => {
      const live = savedSchema();
      mockSmembers.mockResolvedValueOnce(["gone", live.slug]);
      mockGet.mockResolvedValueOnce(null);
      mockGet.mockResolvedValueOnce(JSON.stringify(live));

      await expect(listSchemas("owner-1")).resolves.toEqual([live]);
    });

    it("rejects when Redis smembers fails", async () => {
      mockSmembers.mockRejectedValueOnce(new Error("redis members failed"));

      await expect(listSchemas("owner-1")).rejects.toThrow("redis members failed");
    });
  });

  describe("deleteSchema", () => {
    it("returns false when the schema is missing", async () => {
      mockGet.mockResolvedValueOnce(null);

      await expect(deleteSchema("missing", "owner-1")).resolves.toBe(false);
      expect(mockDel).not.toHaveBeenCalled();
    });

    it("returns false when mfId does not match", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema()));

      await expect(deleteSchema("abc123defg", "other-owner")).resolves.toBe(false);
      expect(mockDel).not.toHaveBeenCalled();
    });

    it("deletes the key and removes the index member", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema()));
      mockDel.mockResolvedValueOnce(1);
      mockSrem.mockResolvedValueOnce(1);

      await expect(deleteSchema("abc123defg", "owner-1")).resolves.toBe(true);
      expect(mockDel).toHaveBeenCalledWith("schema:abc123defg");
      expect(mockSrem).toHaveBeenCalledWith("mf:owner-1:schemas", "abc123defg");
    });

    it("rejects when Redis del fails", async () => {
      mockGet.mockResolvedValueOnce(JSON.stringify(savedSchema()));
      mockDel.mockRejectedValueOnce(new Error("redis delete failed"));

      await expect(deleteSchema("abc123defg", "owner-1")).rejects.toThrow("redis delete failed");
    });
  });
});
