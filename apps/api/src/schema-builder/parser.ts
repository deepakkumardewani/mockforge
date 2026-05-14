import { z } from "zod";
import type { SchemaDefinition } from "@mockforge/types";

const fieldTypeEnum = z.enum([
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
]);

const schemaFieldSchema = z
  .object({
    name: z.string().min(1, "Field name is required"),
    type: fieldTypeEnum,
    values: z.array(z.string()).min(1).optional(),
    items: fieldTypeEnum.optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    required: z.boolean().optional(),
  })
  .superRefine((field, ctx) => {
    if (field.type === "enum" && (!field.values || field.values.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Field type "enum" requires a non-empty "values" array',
        path: ["values"],
      });
    }
    if (
      field.type === "array" &&
      (!field.items || field.items === "array")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Field type "array" requires an "items" type (cannot be "array")',
        path: ["items"],
      });
    }
  });

const schemaDefinitionSchema = z.object({
  name: z.string().min(1, "Schema name is required"),
  fields: z
    .array(schemaFieldSchema)
    .min(1, "At least one field is required"),
});

export function parseSchema(input: unknown): SchemaDefinition {
  return schemaDefinitionSchema.parse(input) as SchemaDefinition;
}
