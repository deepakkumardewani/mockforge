import { z } from "zod";

export const SCHEMA_FIELD_TYPES = [
  "string",
  "number",
  "boolean",
  "date",
  "enum",
  "uuid",
  "email",
  "url",
  "image",
  "array",
] as const;

export type SchemaFieldType = (typeof SCHEMA_FIELD_TYPES)[number];

export const schemaFieldTypeSchema = z.enum(SCHEMA_FIELD_TYPES);

const optionalNumber = z.preprocess(
  (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
  z.number().optional(),
);

export const builderFieldSchema = z
  .object({
    name: z.string().min(1, "Field name is required"),
    type: schemaFieldTypeSchema,
    values: z.string().optional(),
    items: schemaFieldTypeSchema.optional(),
    min: optionalNumber,
    max: optionalNumber,
  })
  .superRefine((field, ctx) => {
    if (
      field.type === "enum" &&
      !(field.values ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Field type "enum" requires a non-empty "values" array',
        path: ["values"],
      });
    }
    if (field.type === "array" && (!field.items || field.items === "array")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Field type "array" requires an "items" type (cannot be "array")',
        path: ["items"],
      });
    }
  });

export const builderFormValuesSchema = z.object({
  name: z.string().min(1, "Schema name is required"),
  fields: z.array(builderFieldSchema).min(1, "At least one field is required"),
});

export interface BuilderField {
  name: string;
  type: SchemaFieldType;
  values?: string;
  items?: SchemaFieldType;
  min?: number;
  max?: number;
}

export interface BuilderFormValues {
  name: string;
  fields: BuilderField[];
}

export interface SchemaFieldForApi {
  name: string;
  type: SchemaFieldType;
  values?: string[];
  items?: SchemaFieldType;
  min?: number;
  max?: number;
}

export interface SchemaDefinition {
  name: string;
  fields: SchemaFieldForApi[];
}

export interface SavedSchema {
  slug: string;
  mfId: string;
  definition: SchemaDefinition;
  persistent: boolean;
  endpoint: string;
  createdAt: string;
}
