import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { parseSchema } from "../schema-builder/parser";
import { saveSchema, listSchemas, deleteSchema, updateSchema } from "../schema-builder/store";
import type { SchemaDefinition } from "@mockforge/types";
import type { Context } from "hono";

const schemaBody = z.object({
  name: z.string().min(1),
  fields: z.array(z.any()).min(1),
  persistent: z.boolean().optional(),
});

const createSchemaBody = schemaBody.extend({
  persistent: z.boolean().default(false),
});

const router = new Hono();

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

function parseDefinition(body: { name: string; fields: unknown[] }): SchemaDefinition {
  return parseSchema({ name: body.name, fields: body.fields });
}

router.post("/", zValidator("json", createSchemaBody), async (c) => {
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
  const mfId = c.get("mfId");
  const schemas = await listSchemas(mfId);
  return c.json({ data: schemas });
});

router.delete("/:slug", async (c) => {
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
