import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import graphqlRouter from "./index";

function createApp() {
  const app = new Hono();
  app.route("/graphql", graphqlRouter);
  return app;
}

function postQuery(query: string) {
  return createApp().request("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
}

describe("GraphQL Hono router", () => {
  it("executes a simple query through yoga.fetch", async () => {
    const res = await postQuery(`
      query {
        products(limit: 1) {
          id
          title
        }
      }
    `);
    const body = (await res.json()) as {
      data?: { products?: { id: string; title: string }[] };
      errors?: unknown;
    };

    expect(res.status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.products).toHaveLength(1);
    expect(body.data?.products?.[0]).toHaveProperty("id");
    expect(body.data?.products?.[0]).toHaveProperty("title");
  });

  it("returns GraphQL errors for an invalid query", async () => {
    const res = await postQuery(`
      query {
        notARealField {
          id
        }
      }
    `);
    const body = (await res.json()) as { errors?: unknown[] };

    expect(res.status).toBe(200);
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors?.length).toBeGreaterThan(0);
  });
});
