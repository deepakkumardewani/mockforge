import { describe, it, expect } from "vitest";
import {
  coerceToFormValues,
  definitionToFormValues,
  fieldToApi,
  formValuesToApiBody,
  formValuesToDefinition,
  formValuesToJsonPayload,
  generatePreviewRecords,
  isPreviewableField,
  parseEnumValues,
  savedSchemaToFormValues,
} from "@/components/builder/schema-convert";
import type { BuilderFormValues, SavedSchema, SchemaDefinition } from "@/components/builder/types";

const namedString: BuilderFormValues = {
  name: "Products",
  fields: [{ name: "title", type: "string" }],
};

describe("parseEnumValues", () => {
  it("returns an empty array when the raw value is missing", () => {
    expect(parseEnumValues()).toEqual([]);
    expect(parseEnumValues(undefined)).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseEnumValues("")).toEqual([]);
  });

  it("splits, trims, and drops blank tokens", () => {
    expect(parseEnumValues(" red, green , ,blue ")).toEqual(["red", "green", "blue"]);
  });
});

describe("fieldToApi", () => {
  it("trims the field name and keeps a simple type", () => {
    expect(fieldToApi({ name: "  title  ", type: "string" })).toEqual({
      name: "title",
      type: "string",
    });
  });

  it("attaches enum values when they parse to a non-empty list", () => {
    expect(fieldToApi({ name: "status", type: "enum", values: "open, closed" })).toEqual({
      name: "status",
      type: "enum",
      values: ["open", "closed"],
    });
  });

  it("omits enum values when the raw list is empty", () => {
    expect(fieldToApi({ name: "status", type: "enum", values: " , " })).toEqual({
      name: "status",
      type: "enum",
    });
  });

  it("attaches array items only when they are a non-array type", () => {
    expect(fieldToApi({ name: "tags", type: "array", items: "string" })).toEqual({
      name: "tags",
      type: "array",
      items: "string",
    });
    expect(fieldToApi({ name: "tags", type: "array", items: "array" })).toEqual({
      name: "tags",
      type: "array",
    });
    expect(fieldToApi({ name: "tags", type: "array" })).toEqual({
      name: "tags",
      type: "array",
    });
  });

  it("copies number min and max when they are finite numbers", () => {
    expect(fieldToApi({ name: "price", type: "number", min: 1, max: 99 })).toEqual({
      name: "price",
      type: "number",
      min: 1,
      max: 99,
    });
  });

  it("omits NaN number bounds", () => {
    expect(fieldToApi({ name: "price", type: "number", min: Number.NaN, max: Number.NaN })).toEqual(
      {
        name: "price",
        type: "number",
      },
    );
  });
});

describe("isPreviewableField", () => {
  it("rejects fields without a name", () => {
    expect(isPreviewableField({ name: "", type: "string" })).toBe(false);
  });

  it("requires enum values", () => {
    expect(isPreviewableField({ name: "status", type: "enum" })).toBe(false);
    expect(isPreviewableField({ name: "status", type: "enum", values: [] })).toBe(false);
    expect(isPreviewableField({ name: "status", type: "enum", values: ["open"] })).toBe(true);
  });

  it("requires array items that are not nested arrays", () => {
    expect(isPreviewableField({ name: "tags", type: "array" })).toBe(false);
    expect(isPreviewableField({ name: "tags", type: "array", items: "array" })).toBe(false);
    expect(isPreviewableField({ name: "tags", type: "array", items: "string" })).toBe(true);
  });

  it("allows other named types", () => {
    expect(isPreviewableField({ name: "title", type: "string" })).toBe(true);
  });
});

describe("formValuesToDefinition", () => {
  it("trims the schema name and drops unnamed fields by default", () => {
    expect(
      formValuesToDefinition({
        name: "  Catalog  ",
        fields: [
          { name: "  title  ", type: "string" },
          { name: "   ", type: "number" },
        ],
      }),
    ).toEqual({
      name: "Catalog",
      fields: [{ name: "title", type: "string" }],
    });
  });

  it("falls back to Untitled when the name is blank", () => {
    expect(formValuesToDefinition({ name: "   ", fields: [] })).toEqual({
      name: "Untitled",
      fields: [],
    });
  });

  it("keeps unnamed fields when includeUnnamed is true", () => {
    const definition = formValuesToDefinition(
      { name: "Draft", fields: [{ name: "  ", type: "string" }] },
      { includeUnnamed: true },
    );
    expect(definition.fields).toEqual([{ name: "", type: "string" }]);
  });
});

describe("formValuesToJsonPayload", () => {
  it("keeps the raw name and includes unnamed fields", () => {
    expect(
      formValuesToJsonPayload({
        name: "  Draft  ",
        fields: [{ name: "  ", type: "boolean" }],
      }),
    ).toEqual({
      name: "  Draft  ",
      fields: [{ name: "", type: "boolean" }],
    });
  });
});

describe("formValuesToApiBody", () => {
  it("adds the persistent flag to the definition", () => {
    expect(formValuesToApiBody(namedString, true)).toEqual({
      name: "Products",
      fields: [{ name: "title", type: "string" }],
      persistent: true,
    });
    expect(formValuesToApiBody(namedString, false).persistent).toBe(false);
  });
});

describe("definitionToFormValues", () => {
  it("joins enum values and copies optional bounds", () => {
    const definition: SchemaDefinition = {
      name: "Catalog",
      fields: [
        { name: "status", type: "enum", values: ["open", "closed"] },
        { name: "price", type: "number", min: 1, max: 10 },
        { name: "tags", type: "array", items: "string" },
      ],
    };

    expect(definitionToFormValues(definition)).toEqual({
      name: "Catalog",
      fields: [
        {
          name: "status",
          type: "enum",
          values: "open, closed",
          items: undefined,
          min: undefined,
          max: undefined,
        },
        { name: "price", type: "number", values: undefined, items: undefined, min: 1, max: 10 },
        {
          name: "tags",
          type: "array",
          values: undefined,
          items: "string",
          min: undefined,
          max: undefined,
        },
      ],
    });
  });
});

describe("savedSchemaToFormValues", () => {
  it("reads the nested definition", () => {
    const schema: SavedSchema = {
      slug: "products",
      mfId: "test-mf-id",
      definition: { name: "Products", fields: [{ name: "title", type: "string" }] },
      persistent: false,
      endpoint: "/api/custom/products",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    expect(savedSchemaToFormValues(schema)).toEqual({
      name: "Products",
      fields: [
        {
          name: "title",
          type: "string",
          values: undefined,
          items: undefined,
          min: undefined,
          max: undefined,
        },
      ],
    });
  });
});

describe("coerceToFormValues", () => {
  it("returns null for non-objects and missing shape", () => {
    expect(coerceToFormValues(null)).toBeNull();
    expect(coerceToFormValues("schema")).toBeNull();
    expect(coerceToFormValues(12)).toBeNull();
    expect(coerceToFormValues({ fields: [] })).toBeNull();
    expect(coerceToFormValues({ name: "Catalog" })).toBeNull();
    expect(coerceToFormValues({ name: "Catalog", fields: "nope" })).toBeNull();
  });

  it("returns null when any field entry is not an object", () => {
    expect(coerceToFormValues({ name: "Catalog", fields: [null] })).toBeNull();
    expect(coerceToFormValues({ name: "Catalog", fields: ["title"] })).toBeNull();
  });

  it("defaults unknown types and items, and normalizes values", () => {
    expect(
      coerceToFormValues({
        name: "Catalog",
        fields: [
          {
            name: "status",
            type: "not-a-type",
            items: "also-invalid",
            values: ["open", 2, "closed"],
            min: Number.NaN,
            max: "10",
          },
          {
            name: 9,
            type: "number",
            values: "small, large",
            items: "string",
            min: 1,
            max: 5,
          },
        ],
      }),
    ).toEqual({
      name: "Catalog",
      fields: [
        {
          name: "status",
          type: "string",
          values: "open, closed",
          items: undefined,
          min: undefined,
          max: undefined,
        },
        {
          name: "",
          type: "number",
          values: "small, large",
          items: "string",
          min: 1,
          max: 5,
        },
      ],
    });
  });

  it("omits values that are neither a string nor a string array", () => {
    const result = coerceToFormValues({
      name: "Catalog",
      fields: [{ name: "title", type: "string", values: 12 }],
    });
    expect(result?.fields[0]?.values).toBeUndefined();
  });
});

describe("generatePreviewRecords", () => {
  it("returns an empty list when no previewable fields exist", () => {
    expect(generatePreviewRecords({ name: "Empty", fields: [] })).toEqual([]);
    expect(
      generatePreviewRecords({
        name: "Draft",
        fields: [
          { name: "", type: "string" },
          { name: "status", type: "enum", values: "" },
          { name: "tags", type: "array" },
        ],
      }),
    ).toEqual([]);
  });

  it("caps rows between 1 and 3 regardless of the requested count", () => {
    expect(generatePreviewRecords(namedString, 0)).toHaveLength(1);
    expect(generatePreviewRecords(namedString, 2)).toHaveLength(2);
    expect(generatePreviewRecords(namedString)).toHaveLength(3);
    expect(generatePreviewRecords(namedString, 10)).toHaveLength(3);
  });

  it("samples every scalar type and array items", () => {
    const values: BuilderFormValues = {
      name: "Kitchen sink",
      fields: [
        { name: "title", type: "string" },
        { name: "price", type: "number", min: 2, max: 4 },
        { name: "qty", type: "number" },
        { name: "fixed", type: "number", min: 8 },
        { name: "clamped", type: "number", min: 10, max: 4 },
        { name: "active", type: "boolean" },
        { name: "publishedAt", type: "date" },
        { name: "status", type: "enum", values: "open, closed" },
        { name: "idKey", type: "uuid" },
        { name: "user-name!", type: "email" },
        { name: "home page", type: "url" },
        { name: "hero", type: "image" },
        { name: "tags", type: "array", items: "string" },
      ],
    };

    const [first, second] = generatePreviewRecords(values, 2);

    expect(first).toMatchObject({
      id: 1,
      title: "title-1",
      price: 2,
      qty: 1,
      fixed: 8,
      clamped: 10,
      active: true,
      publishedAt: "2026-01-01T12:00:00.000Z",
      status: "open",
      idKey: "00000000-0000-4000-8000-000000000001",
      "user-name!": "user.name..1@example.com",
      "home page": "https://example.com/home%20page/1",
      hero: "https://picsum.photos/seed/hero-1/200",
      tags: ["tags-1", "tags-2"],
    });
    expect(second).toMatchObject({
      id: 2,
      title: "title-2",
      price: 3,
      qty: 2,
      fixed: 8,
      active: false,
      publishedAt: "2026-01-02T12:00:00.000Z",
      status: "closed",
      tags: ["tags-3", "tags-4"],
    });
  });
});
