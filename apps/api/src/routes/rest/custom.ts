import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getSchema } from "../../schema-builder/store";
import { generateFromSchema } from "../../schema-builder/generator";
import { CUSTOM_SEARCH_SAMPLE_SIZE, pageRecords, paginationSchema } from "../../lib/pagination";
import { respond } from "../../lib/respond";

const router = new Hono();

router.get("/:slug", zValidator("query", paginationSchema), async (c) => {
  const slug = c.req.param("slug");
  const schema = await getSchema(slug);
  if (!schema) {
    return c.json({ error: { code: "NOT_FOUND", message: "Schema not found" } }, 404);
  }

  const params = c.req.valid("query");
  const itemsToGenerate = params.search ? CUSTOM_SEARCH_SAMPLE_SIZE : params.limit + params.skip;
  let records = generateFromSchema(schema.definition, itemsToGenerate);

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    records = records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(searchLower)),
    );
  }

  const data = pageRecords(records, params);

  return c.json(respond(data, records.length, params, schema.definition.name));
});

router.get("/:slug/:id", async (c) => {
  const slug = c.req.param("slug");
  const requestedId = c.req.param("id");
  const schema = await getSchema(slug);
  if (!schema) {
    return c.json({ error: { code: "NOT_FOUND", message: "Schema not found" } }, 404);
  }

  // Records are generated on the fly (not stored). Stamp the path id so the
  // detail contract matches the request; other fields remain a fresh sample.
  const records = generateFromSchema(schema.definition, 1);
  return c.json({ data: { ...records[0], id: requestedId } });
});

export default router;
