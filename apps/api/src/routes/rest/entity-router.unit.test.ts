import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { createEntityRouter } from "./entity-router";
import type { PaginationParams } from "../../lib/pagination";

function testGenerate(params: PaginationParams) {
  const start = params.skip;
  const end = start + params.limit;
  return Array.from({ length: end - start }, (_, index) => ({
    id: String(start + index + 1),
    title: `item-${start + index + 1}`,
    search: params.search ?? null,
  }));
}

describe("createEntityRouter", () => {
  const app = new Hono();
  app.route("/widgets", createEntityRouter({ entity: "widgets", generate: testGenerate }));

  it("lists widgets with pagination envelope", async () => {
    const res = await app.request("/widgets?limit=2&skip=1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: unknown[]; total: number; limit: number };
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(100);
    expect(body.limit).toBe(2);
  });

  it("searches with the q query parameter", async () => {
    const res = await app.request("/widgets/search?q=needle");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { search: string | null }[] };
    expect(body.data[0]?.search).toBe("needle");
  });

  it("returns a seeded row for GET /:id", async () => {
    const res = await app.request("/widgets/3");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { id: string } };
    expect(body.data?.id).toBe("3");
  });

  it("creates a row from generated data merged with JSON body", async () => {
    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "custom" }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { data: { title: string } };
    expect(body.data.title).toBe("custom");
  });

  it("returns null data when PUT targets an unknown id", async () => {
    const res = await app.request("/widgets/not-found", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "nope" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: null };
    expect(body.data).toBeNull();
  });

  it("merges PUT body onto an existing seeded row", async () => {
    const res = await app.request("/widgets/2", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "updated" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { id: string; title: string } };
    expect(body.data.id).toBe("2");
    expect(body.data.title).toBe("updated");
  });

  it("treats invalid JSON bodies as empty overlays", async () => {
    const res = await app.request("/widgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { data: { title: string } };
    expect(body.data.title).toMatch(/^item-/);
  });

  it("deletes by id", async () => {
    const res = await app.request("/widgets/9", { method: "DELETE" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { deleted: boolean; id: string };
    expect(body).toEqual({ deleted: true, id: "9" });
  });
});
