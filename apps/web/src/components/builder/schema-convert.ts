import { SCHEMA_FIELD_TYPES } from "./types";
import type {
  BuilderField,
  BuilderFormValues,
  SavedSchema,
  SchemaDefinition,
  SchemaFieldForApi,
  SchemaFieldType,
} from "./types";

const PREVIEW_ROW_COUNT = 3;

export function parseEnumValues(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isSchemaFieldType(value: unknown): value is SchemaFieldType {
  return typeof value === "string" && (SCHEMA_FIELD_TYPES as readonly string[]).includes(value);
}

export function fieldToApi(field: BuilderField): SchemaFieldForApi {
  const next: SchemaFieldForApi = {
    name: field.name.trim(),
    type: field.type,
  };

  if (field.type === "enum") {
    const values = parseEnumValues(field.values);
    if (values.length > 0) next.values = values;
  }

  if (field.type === "array" && field.items && field.items !== "array") {
    next.items = field.items;
  }

  if (field.type === "number") {
    if (field.min !== undefined && !Number.isNaN(field.min)) next.min = field.min;
    if (field.max !== undefined && !Number.isNaN(field.max)) next.max = field.max;
  }

  return next;
}

export function isPreviewableField(field: SchemaFieldForApi): boolean {
  if (!field.name) return false;
  if (field.type === "enum") return Boolean(field.values && field.values.length > 0);
  if (field.type === "array") return Boolean(field.items && field.items !== "array");
  return true;
}

export function formValuesToDefinition(
  values: BuilderFormValues,
  options?: { includeUnnamed?: boolean },
): SchemaDefinition {
  const fields = values.fields
    .filter((field) => options?.includeUnnamed || field.name.trim().length > 0)
    .map(fieldToApi);

  return {
    name: values.name.trim() || "Untitled",
    fields,
  };
}

export function formValuesToJsonPayload(values: BuilderFormValues): SchemaDefinition {
  return {
    name: values.name,
    fields: values.fields.map(fieldToApi),
  };
}

export function formValuesToApiBody(values: BuilderFormValues, persistent: boolean) {
  return {
    ...formValuesToDefinition(values),
    persistent,
  };
}

export function definitionToFormValues(definition: SchemaDefinition): BuilderFormValues {
  return {
    name: definition.name,
    fields: definition.fields.map((field) => ({
      name: field.name,
      type: field.type,
      values: field.values?.join(", "),
      items: field.items,
      min: field.min,
      max: field.max,
    })),
  };
}

export function savedSchemaToFormValues(schema: SavedSchema): BuilderFormValues {
  return definitionToFormValues(schema.definition);
}

export function coerceToFormValues(raw: unknown): BuilderFormValues | null {
  if (typeof raw !== "object" || raw === null) return null;

  const obj = raw as Record<string, unknown>;
  if (typeof obj.name !== "string" || !Array.isArray(obj.fields)) return null;

  const fields: Array<BuilderField | null> = obj.fields.map((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return null;
    const field = entry as Record<string, unknown>;
    const type = isSchemaFieldType(field.type) ? field.type : "string";
    const items = isSchemaFieldType(field.items) ? field.items : undefined;

    return {
      name: typeof field.name === "string" ? field.name : "",
      type,
      values: Array.isArray(field.values)
        ? field.values.filter((v): v is string => typeof v === "string").join(", ")
        : typeof field.values === "string"
          ? field.values
          : undefined,
      items,
      min: typeof field.min === "number" && !Number.isNaN(field.min) ? field.min : undefined,
      max: typeof field.max === "number" && !Number.isNaN(field.max) ? field.max : undefined,
    };
  });

  if (fields.some((field) => field === null)) return null;

  return { name: obj.name, fields: fields as BuilderField[] };
}

function sampleScalar(field: SchemaFieldForApi, row: number): unknown {
  switch (field.type) {
    case "string":
      return `${field.name}-${row + 1}`;
    case "number": {
      const min = field.min ?? 1;
      const max = field.max ?? Math.max(min, 3);
      const span = Math.max(max - min, 0);
      return min + (row % (span + 1));
    }
    case "boolean":
      return row % 2 === 0;
    case "date":
      return `2026-01-${String(row + 1).padStart(2, "0")}T12:00:00.000Z`;
    case "enum": {
      const values = field.values ?? [];
      return values[row % values.length];
    }
    case "uuid":
      return `00000000-0000-4000-8000-${String(row + 1).padStart(12, "0")}`;
    case "email":
      return `${field.name.replace(/[^a-zA-Z0-9]+/g, ".")}.${row + 1}@example.com`;
    case "url":
      return `https://example.com/${encodeURIComponent(field.name)}/${row + 1}`;
    case "image":
      return `https://picsum.photos/seed/${encodeURIComponent(field.name)}-${row + 1}/200`;
    case "array":
      return [];
  }
}

function sampleValue(field: SchemaFieldForApi, row: number): unknown {
  if (field.type === "array" && field.items && field.items !== "array") {
    return [0, 1].map((offset) =>
      sampleScalar({ name: field.name, type: field.items as SchemaFieldType }, row * 2 + offset),
    );
  }
  return sampleScalar(field, row);
}

export function generatePreviewRecords(
  values: BuilderFormValues,
  count = PREVIEW_ROW_COUNT,
): Record<string, unknown>[] {
  const fields = formValuesToDefinition(values).fields.filter(isPreviewableField);
  if (fields.length === 0) return [];

  const rows = Math.min(PREVIEW_ROW_COUNT, Math.max(1, count));
  return Array.from({ length: rows }, (_, row) => {
    const record: Record<string, unknown> = { id: row + 1 };
    for (const field of fields) {
      record[field.name] = sampleValue(field, row);
    }
    return record;
  });
}
