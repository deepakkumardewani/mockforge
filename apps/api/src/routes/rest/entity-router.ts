import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { paginationSchema, type PaginationParams } from "../../lib/pagination";
import { findSeededById, findSeededByIdRest } from "../../lib/seeded-lookup";
import { respond } from "../../lib/respond";

const SEARCH_QUERY = z.object({ q: z.string().default("") });
const SEEDED_LIST_TOTAL = 100;

export type EntityGenerator<T> = (params: PaginationParams) => T[];

export interface EntityRouterConfig<T> {
  entity: string;
  generate: EntityGenerator<T>;
}

async function readJsonObject(c: { req: { json: () => Promise<unknown> } }) {
  const body = await c.req.json().catch(() => ({}));
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {};
  }
  return body as Record<string, unknown>;
}

function mergeRecord<T>(base: T | null, patch: Record<string, unknown>) {
  return { ...base, ...patch };
}

function registerListRoutes<T>(router: Hono, entity: string, generate: EntityGenerator<T>) {
  router.get("/", zValidator("query", paginationSchema), (c) => {
    const params = c.req.valid("query");
    return c.json(respond(generate(params), SEEDED_LIST_TOTAL, params, entity));
  });

  router.get("/search", zValidator("query", SEARCH_QUERY), (c) => {
    const { q } = c.req.valid("query");
    const params = paginationSchema.parse({ search: q });
    const data = generate(params);
    return c.json(respond(data, data.length, params, entity));
  });

  router.get("/:id", (c) => {
    return c.json({ data: findSeededByIdRest(generate, c.req.param("id")) });
  });
}

function registerWriteRoutes<T>(router: Hono, generate: EntityGenerator<T>) {
  router.post("/", async (c) => {
    const item = generate({ limit: 1, skip: 0, order: "asc" })[0] ?? null;
    return c.json({ data: mergeRecord(item, await readJsonObject(c)) }, 201);
  });

  router.put("/:id", async (c) => {
    const item = findSeededById(generate, c.req.param("id"));
    if (!item) {
      return c.json({ data: null });
    }
    return c.json({ data: mergeRecord(item, await readJsonObject(c)) });
  });

  router.delete("/:id", (c) => {
    return c.json({ deleted: true, id: c.req.param("id") }, 200);
  });
}

export function createEntityRouter<T>(config: EntityRouterConfig<T>) {
  const router = new Hono();
  registerListRoutes(router, config.entity, config.generate);
  registerWriteRoutes(router, config.generate);
  return router;
}
