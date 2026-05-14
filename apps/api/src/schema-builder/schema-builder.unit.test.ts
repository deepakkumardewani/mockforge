import { describe, it, expect } from "vitest";
import { parseSchema } from "./parser";
import { generateFromSchema } from "./generator";
import type { SchemaDefinition } from "@mockforge/types";

const flightSchema: SchemaDefinition = {
  name: "Flight",
  fields: [
    { name: "origin", type: "enum", values: ["JFK", "LAX", "ORD", "DFW"] },
    { name: "destination", type: "enum", values: ["LHR", "CDG", "NRT", "DXB"] },
    { name: "price", type: "number", min: 100, max: 2000 },
    { name: "status", type: "enum", values: ["on-time", "delayed", "cancelled"] },
  ],
};

const stringArraySchema: SchemaDefinition = {
  name: "TagList",
  fields: [
    { name: "title", type: "string" },
    { name: "tags", type: "array", items: "string" },
  ],
};

describe("parseSchema", () => {
  it("should parse a valid schema definition", () => {
    const result = parseSchema(flightSchema);
    expect(result.name).toBe("Flight");
    expect(result.fields).toHaveLength(4);
  });

  it("should throw on missing name", () => {
    expect(() => parseSchema({ fields: [] })).toThrow();
  });

  it("should throw on empty fields array", () => {
    expect(() => parseSchema({ name: "Test", fields: [] })).toThrow();
  });

  it("should throw on invalid field type", () => {
    expect(() =>
      parseSchema({
        name: "Test",
        fields: [{ name: "bad", type: "unknown" }],
      }),
    ).toThrow();
  });

  it("should throw when enum field has no values", () => {
    expect(() =>
      parseSchema({
        name: "Test",
        fields: [{ name: "status", type: "enum" }],
      }),
    ).toThrow();
  });

  it("should throw when array field has no items", () => {
    expect(() =>
      parseSchema({
        name: "Test",
        fields: [{ name: "list", type: "array" }],
      }),
    ).toThrow();
  });

  it("should throw when array field items is also array", () => {
    expect(() =>
      parseSchema({
        name: "Test",
        fields: [{ name: "list", type: "array", items: "array" }],
      }),
    ).toThrow();
  });

  it("should throw when enum field has empty values array", () => {
    expect(() =>
      parseSchema({
        name: "Test",
        fields: [{ name: "status", type: "enum", values: [] }],
      }),
    ).toThrow();
  });

  it("should accept non-string input (JSON parsed object)", () => {
    const input = JSON.parse(JSON.stringify(flightSchema));
    const result = parseSchema(input);
    expect(result.name).toBe("Flight");
  });
});

describe("generateFromSchema", () => {
  it("should generate the requested number of records", () => {
    const records = generateFromSchema(flightSchema, 5);
    expect(records).toHaveLength(5);
  });

  it("should generate records with an id field", () => {
    const records = generateFromSchema(flightSchema, 2);
    expect(records[0]).toHaveProperty("id");
    expect(typeof records[0].id).toBe("string");
  });

  it("should generate all schema fields in each record", () => {
    const records = generateFromSchema(flightSchema, 3);
    for (const record of records) {
      expect(record).toHaveProperty("origin");
      expect(record).toHaveProperty("destination");
      expect(record).toHaveProperty("price");
      expect(record).toHaveProperty("status");
    }
  });

  it("should generate enum fields that are valid values", () => {
    const records = generateFromSchema(flightSchema, 20);
    const validOrigins = ["JFK", "LAX", "ORD", "DFW"];
    const validStatuses = ["on-time", "delayed", "cancelled"];
    for (const record of records) {
      expect(validOrigins).toContain(record.origin);
      expect(validStatuses).toContain(record.status);
    }
  });

  it("should generate number fields within min/max range", () => {
    const records = generateFromSchema(flightSchema, 20);
    for (const record of records) {
      const price = record.price as number;
      expect(price).toBeGreaterThanOrEqual(100);
      expect(price).toBeLessThanOrEqual(2000);
    }
  });

  it("should generate array(string) fields with 2-5 items", () => {
    const records = generateFromSchema(stringArraySchema, 10);
    for (const record of records) {
      expect(record).toHaveProperty("tags");
      const tags = record.tags as string[];
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThanOrEqual(2);
      expect(tags.length).toBeLessThanOrEqual(5);
      for (const tag of tags) {
        expect(typeof tag).toBe("string");
      }
    }
  });

  it("should return empty array when count is 0", () => {
    const records = generateFromSchema(flightSchema, 0);
    expect(records).toEqual([]);
  });

  it("should generate different data for each record", () => {
    const records = generateFromSchema(flightSchema, 5);
    const first = JSON.stringify(records[0]);
    const second = JSON.stringify(records[1]);
    expect(first).not.toBe(second);
  });
});
