import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { parseSchema } from "../schema-builder/parser";
import { saveSchema, listSchemas, deleteSchema, updateSchema } from "../schema-builder/store";
import type { SchemaDefinition } from "@mockforge/types";
import type { Context } from "hono";
import {
  FIELD_NAME_PATTERN,
  MAX_FIELD_NAME_LENGTH,
  MAX_SCHEMA_BODY_BYTES,
  MAX_SCHEMA_FIELDS,
  MAX_SCHEMA_NAME_LENGTH,
  RESERVED_FIELD_NAMES,
} from "../lib/limits";

const reservedFieldNames = new Set<string>(RESERVED_FIELD_NAMES);

const apiFieldSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(MAX_FIELD_NAME_LENGTH)
      .regex(FIELD_NAME_PATTERN, "Field name must be a JS identifier")
      .refine((name) => !reservedFieldNames.has(name.toLowerCase()), {
        message: "Field name is reserved",
      }),
  })
  .passthrough();

const schemaBody = z.object({
  name: z.string().trim().min(1).max(MAX_SCHEMA_NAME_LENGTH),
  fields: z.array(apiFieldSchema).min(1).max(MAX_SCHEMA_FIELDS),
  persistent: z.boolean().optional(),
});

const createSchemaBody = schemaBody.extend({
  persistent: z.boolean().default(false),
});

const router = new Hono();

router.use(
  "*",
  bodyLimit({
    maxSize: MAX_SCHEMA_BODY_BYTES,
    onError: (c) =>
      c.json(
        {
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "Schema body exceeds the maximum allowed size",
          },
        },
        413,
      ),
  }),
);

function invalidSchemaResponse(c: Context, err: unknown) {
  const zodErr = err as { issues?: unknown };
  return c.json(
    {
      error: {
        code: "INVALID_SCHEMA",
        message: "Schema validation failed",
        details: zodErr.issues,
      },
    },
    400,
  );
}

function requireExplicitMfId(c: Context) {
  if (!c.get("isIpFallback")) return null;
  return c.json(
    {
      error: {
        code: "MF_ID_REQUIRED",
        message: "x-mf-id is required to list or mutate schemas",
      },
    },
    401,
  );
}

function parseDefinition(body: { name: string; fields: unknown[] }): SchemaDefinition {
  return parseSchema({ name: body.name, fields: body.fields });
}

router.post("/", zValidator("json", createSchemaBody), async (c) => {
  const denied = requireExplicitMfId(c);
  if (denied) return denied;

  const body = c.req.valid("json");
  const mfId = c.get("mfId");

  let definition: SchemaDefinition;
  try {
    definition = parseDefinition(body);
  } catch (err: unknown) {
    return invalidSchemaResponse(c, err);
  }

  const slug = await saveSchema(definition, mfId, body.persistent);

  return c.json({ slug, endpoint: `/api/custom/${slug}` }, 201);
});

router.put("/:slug", zValidator("json", schemaBody), async (c) => {
  const denied = requireExplicitMfId(c);
  if (denied) return denied;

  const slug = c.req.param("slug");
  const body = c.req.valid("json");
  const mfId = c.get("mfId");

  let definition: SchemaDefinition;
  try {
    definition = parseDefinition(body);
  } catch (err: unknown) {
    return invalidSchemaResponse(c, err);
  }

  const saved = await updateSchema(slug, definition, mfId, body.persistent);
  if (!saved) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Schema not found or not owned by you" } },
      404,
    );
  }

  return c.json({ slug: saved.slug, endpoint: saved.endpoint });
});

router.get("/", async (c) => {
  const denied = requireExplicitMfId(c);
  if (denied) return denied;

  const mfId = c.get("mfId");
  const schemas = await listSchemas(mfId);
  return c.json({ data: schemas });
});

router.delete("/:slug", async (c) => {
  const denied = requireExplicitMfId(c);
  if (denied) return denied;

  const slug = c.req.param("slug");
  const mfId = c.get("mfId");

  const deleted = await deleteSchema(slug, mfId);
  if (!deleted) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Schema not found or not owned by you" } },
      404,
    );
  }

  return c.json({ deleted: true, slug });
});

export default router;
