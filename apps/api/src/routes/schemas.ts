import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { parseSchema } from "../schema-builder/parser";
import { saveSchema, listSchemas, deleteSchema } from "../schema-builder/store";

const createSchemaBody = z.object({
  name: z.string().min(1),
  fields: z.array(z.any()).min(1),
  persistent: z.boolean().default(false),
});

const router = new Hono();

router.post("/", zValidator("json", createSchemaBody), async (c) => {
  const body = c.req.valid("json");
  const mfId = c.get("mfId");

  let definition;
  try {
    definition = parseSchema({ name: body.name, fields: body.fields });
  } catch (err: unknown) {
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

  const slug = await saveSchema(definition, mfId, body.persistent);

  return c.json({ slug, endpoint: `/api/custom/${slug}` }, 201);
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
