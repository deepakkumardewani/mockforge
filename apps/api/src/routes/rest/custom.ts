import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getSchema } from "../../schema-builder/store";
import { generateFromSchema } from "../../schema-builder/generator";
import { paginationSchema } from "../../lib/pagination";
import { respond } from "../../lib/respond";

const router = new Hono();

router.get("/:slug", zValidator("query", paginationSchema), async (c) => {
  const slug = c.req.param("slug");
  const schema = await getSchema(slug);
  if (!schema) {
    return c.json({ error: { code: "NOT_FOUND", message: "Schema not found" } }, 404);
  }

  const params = c.req.valid("query");
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;
  let records = generateFromSchema(schema.definition, itemsToGenerate);

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    records = records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(searchLower)),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  const data = records.slice(start, end);

  return c.json(respond(data, records.length, params, schema.definition.name));
});

router.get("/:slug/:id", async (c) => {
  const slug = c.req.param("slug");
  const schema = await getSchema(slug);
  if (!schema) {
    return c.json({ error: { code: "NOT_FOUND", message: "Schema not found" } }, 404);
  }

  const records = generateFromSchema(schema.definition, 1);
  return c.json({ data: records[0] });
});

export default router;
