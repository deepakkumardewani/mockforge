import { describe, expect, it } from "vitest";
import { GraphQLError } from "graphql";
import { Hono } from "hono";
import { MAX_GRAPHQL_BODY_BYTES } from "../../lib/limits";
import { queryBudgetPlugin } from "./query-budget";
import graphqlRouter from "./index";

function postQuery(app: Hono, query: string) {
  return app.request("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
}

describe("queryBudgetPlugin", () => {
  it("rejects oversized GraphQL params before execution", async () => {
    const plugin = queryBudgetPlugin();
    const huge = "x".repeat(MAX_GRAPHQL_BODY_BYTES + 1);
    let result: { errors?: GraphQLError[] } | undefined;

    await plugin.onParams?.({
      params: { query: huge },
      setResult: (next) => {
        result = next;
      },
    });

    expect(result?.errors?.[0]?.message).toBe("GraphQL body exceeds the maximum allowed size");
  });
});

describe("GraphQL budget validation", () => {
  const app = new Hono();
  app.route("/graphql", graphqlRouter);

  it("returns validation errors when complexity exceeds budget", async () => {
    const heavy = `
      query {
        a: products(limit: 100) { id }
        b: users(limit: 100) { id }
        c: posts(limit: 100) { id }
      }
    `;
    const res = await postQuery(app, heavy);
    const body = (await res.json()) as { errors?: { message: string }[] };
    expect(body.errors?.some((error) => error.message.includes("complexity"))).toBe(true);
  });

  it("returns validation errors when alias count exceeds budget", async () => {
    const aliases = Array.from(
      { length: 25 },
      (_, index) => `a${index}: products(limit: 1) { id }`,
    ).join("\n");
    const res = await postQuery(app, `query { ${aliases} }`);
    const body = (await res.json()) as { errors?: { message: string }[] };
    expect(body.errors?.some((error) => error.message.includes("alias"))).toBe(true);
  });
});
