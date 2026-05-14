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

export const builderFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: schemaFieldTypeSchema,
  values: z.string().optional(),
  items: schemaFieldTypeSchema.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
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
