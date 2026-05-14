import { describe, it, expect } from "vitest";
import { paginationSchema, type PaginationParams } from "./pagination";
import { respond } from "./respond";

describe("pagination", () => {
  describe("paginationSchema", () => {
    it("should coerce string limit to number", () => {
      const result = paginationSchema.parse({ limit: "5" });
      expect(result.limit).toBe(5);
      expect(typeof result.limit).toBe("number");
    });

    it("should apply default values", () => {
      const result = paginationSchema.parse({});
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
      expect(result.order).toBe("asc");
    });

    it("should enforce min/max constraints", () => {
      expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
      expect(() => paginationSchema.parse({ skip: -1 })).toThrow();
    });

    it("should parse all fields correctly", () => {
      const result = paginationSchema.parse({
        limit: "25",
        skip: "5",
        search: "test",
        sort: "name",
        order: "desc",
      });
      expect(result).toEqual({
        limit: 25,
        skip: 5,
        search: "test",
        sort: "name",
        order: "desc",
      });
    });
  });

  describe("respond", () => {
    it("should return correct envelope shape", () => {
      const data = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ];
      const params: PaginationParams = {
        limit: 10,
        skip: 0,
        order: "asc",
      };
      const result = respond(data, 2, params, "test_entity");

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("skip");
      expect(result).toHaveProperty("meta");
      expect(result.data.length).toBe(2);
    });

    it("should include generatedAt timestamp in meta", () => {
      const data = [{ id: "1" }];
      const params: PaginationParams = { limit: 10, skip: 0, order: "asc" };
      const result = respond(data, 1, params, "users");

      expect(result.meta.generatedAt).toBeDefined();
      expect(() => new Date(result.meta.generatedAt)).not.toThrow();
    });

    it("should preserve pagination params in response", () => {
      const data: unknown[] = [];
      const params: PaginationParams = {
        limit: 25,
        skip: 50,
        order: "desc",
      };
      const result = respond(data, 100, params, "products");

      expect(result.limit).toBe(25);
      expect(result.skip).toBe(50);
      expect(result.total).toBe(100);
    });

    it("should set entity in meta", () => {
      const data: unknown[] = [];
      const params: PaginationParams = { limit: 10, skip: 0, order: "asc" };
      const result = respond(data, 0, params, "custom_entity");

      expect(result.meta.entity).toBe("custom_entity");
    });
  });
});
