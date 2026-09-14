import { z } from "zod";
import {
  SCHEMA_FIELD_TYPES,
  type SavedSchema,
  type SchemaDefinition,
  type SchemaField,
  type SchemaFieldType,
} from "@mockforge/types";

export { SCHEMA_FIELD_TYPES };
export type { SavedSchema, SchemaDefinition, SchemaField, SchemaFieldType };

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
    required: z.boolean().optional(),
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

/** UI form field: enum values stay comma-separated until API conversion. */
export interface BuilderField {
  name: string;
  type: SchemaFieldType;
  values?: string;
  items?: SchemaFieldType;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface BuilderFormValues {
  name: string;
  fields: BuilderField[];
}
