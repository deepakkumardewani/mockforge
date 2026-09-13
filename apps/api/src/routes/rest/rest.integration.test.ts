import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import rest from "./index";

const RESOURCES = [
  "users",
  "products",
  "posts",
  "comments",
  "todos",
  "carts",
  "messages",
  "notifications",
  "quotes",
  "recipes",
  "countries",
  "companies",
  "stocks",
  "events",
] as const;

function createApp() {
  const app = new Hono();
  app.route("/api", rest);
  return app;
}

describe.each(RESOURCES)("REST /api/%s", (resource) => {
  const base = `/api/${resource}`;

  it("lists with data/total/limit/skip/meta.entity envelope", async () => {
    const app = createApp();
    const res = await app.request(base);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.total).toBe(100);
    expect(json.limit).toBe(30);
    expect(json.skip).toBe(0);
    expect(json.meta.entity).toBe(resource);
  });

  it("searches with q and returns an envelope", async () => {
    const app = createApp();
    const res = await app.request(`${base}/search?q=a`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("limit");
    expect(json).toHaveProperty("skip");
    expect(json.meta.entity).toBe(resource);
  });

  it("gets by numeric id", async () => {
    const app = createApp();
    const res = await app.request(`${base}/3`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeTypeOf("object");
    expect(json.data).not.toBeNull();
  });

  it("falls back for non-numeric id", async () => {
    const app = createApp();
    const res = await app.request(`${base}/not-a-number`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeTypeOf("object");
    expect(json.data).not.toBeNull();
  });

  it("POSTs 201 and merges body", async () => {
    const app = createApp();
    const res = await app.request(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ marker: "created-via-test" }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.marker).toBe("created-via-test");
  });

  it("PUTs and merges body", async () => {
    const app = createApp();
    const res = await app.request(`${base}/1`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ marker: "updated-via-test" }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.marker).toBe("updated-via-test");
  });

  it("DELETEs with deleted true and id", async () => {
    const app = createApp();
    const res = await app.request(`${base}/42`, { method: "DELETE" });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ deleted: true, id: "42" });
  });

  it.each(["0", "101"])("rejects invalid pagination limit=%s with 400", async (limit) => {
    const app = createApp();
    const res = await app.request(`${base}?limit=${limit}`);

    expect(res.status).toBe(400);
  });
});

describe("REST /api/users pagination", () => {
  it("returns length 2 when limit=2", async () => {
    const app = createApp();
    const res = await app.request("/api/users?limit=2");

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.limit).toBe(2);
    expect(json.meta.entity).toBe("users");
  });
});
