import { describe, it, expect } from "vitest";
import { createYoga } from "graphql-yoga";
import builder from "./builder";

import "./types/tier1";
import "./types/tier2";
import "./types/delete-result";

import "./queries/tier1";
import "./queries/tier2";

import "./mutations/tier1";
import "./mutations/tier1-crud";
import "./mutations/tier2-crud";

const schema = builder.toSchema();
const yoga = createYoga({
  schema,
  graphiql: false,
});

type GqlBody = {
  data?: Record<string, Record<string, unknown> | Array<Record<string, unknown>> | null>;
  errors?: { message: string }[];
};

async function executeGraphql(query: string): Promise<{ status: number; body: GqlBody }> {
  const response = await yoga.fetch(
    new Request("http://localhost/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
  );
  return { status: response.status, body: (await response.json()) as GqlBody };
}

type MutationCase = {
  name: string;
  args: string;
  selection: string;
  expected: Record<string, unknown>;
};

const CRUD_MUTATIONS: MutationCase[] = [
  {
    name: "createUser",
    args: `firstName: "Ada"`,
    selection: "firstName",
    expected: { firstName: "Ada" },
  },
  {
    name: "updateUser",
    args: `id: "user-1", firstName: "Ada"`,
    selection: "firstName",
    expected: { firstName: "Ada" },
  },
  {
    name: "deleteUser",
    args: `id: "user-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "user-1" },
  },

  {
    name: "createProduct",
    args: `title: "Gadget"`,
    selection: "title",
    expected: { title: "Gadget" },
  },
  {
    name: "updateProduct",
    args: `id: "prod-1", title: "Gadget"`,
    selection: "title",
    expected: { title: "Gadget" },
  },
  {
    name: "deleteProduct",
    args: `id: "prod-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "prod-1" },
  },

  {
    name: "updatePost",
    args: `id: "post-1", title: "Hello"`,
    selection: "title",
    expected: { title: "Hello" },
  },
  {
    name: "deletePost",
    args: `id: "post-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "post-1" },
  },

  {
    name: "createComment",
    args: `body: "Nice post"`,
    selection: "body",
    expected: { body: "Nice post" },
  },
  {
    name: "updateComment",
    args: `id: "cmt-1", body: "Nice post"`,
    selection: "body",
    expected: { body: "Nice post" },
  },
  {
    name: "deleteComment",
    args: `id: "cmt-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "cmt-1" },
  },

  {
    name: "createTodo",
    args: `todo: "Ship it", completed: true`,
    selection: "todo completed",
    expected: { todo: "Ship it", completed: true },
  },
  {
    name: "deleteTodo",
    args: `id: "todo-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "todo-1" },
  },

  { name: "createCart", args: `total: 19.5`, selection: "total", expected: { total: 19.5 } },
  {
    name: "updateCart",
    args: `id: "cart-1", total: 19.5`,
    selection: "total",
    expected: { total: 19.5 },
  },
  {
    name: "deleteCart",
    args: `id: "cart-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "cart-1" },
  },

  { name: "createMessage", args: `body: "Ping"`, selection: "body", expected: { body: "Ping" } },
  {
    name: "updateMessage",
    args: `id: "msg-1", body: "Ping"`,
    selection: "body",
    expected: { body: "Ping" },
  },
  {
    name: "deleteMessage",
    args: `id: "msg-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "msg-1" },
  },

  {
    name: "createNotification",
    args: `title: "Alert"`,
    selection: "title",
    expected: { title: "Alert" },
  },
  {
    name: "updateNotification",
    args: `id: "ntf-1", title: "Alert"`,
    selection: "title",
    expected: { title: "Alert" },
  },
  {
    name: "deleteNotification",
    args: `id: "ntf-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "ntf-1" },
  },

  {
    name: "createQuote",
    args: `content: "Be kind"`,
    selection: "content",
    expected: { content: "Be kind" },
  },
  {
    name: "updateQuote",
    args: `id: "qte-1", content: "Be kind"`,
    selection: "content",
    expected: { content: "Be kind" },
  },
  {
    name: "deleteQuote",
    args: `id: "qte-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "qte-1" },
  },

  { name: "createRecipe", args: `name: "Soup"`, selection: "name", expected: { name: "Soup" } },
  {
    name: "updateRecipe",
    args: `id: "rcp-1", name: "Soup"`,
    selection: "name",
    expected: { name: "Soup" },
  },
  {
    name: "deleteRecipe",
    args: `id: "rcp-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "rcp-1" },
  },

  {
    name: "createCountry",
    args: `name: "Nowhere"`,
    selection: "name",
    expected: { name: "Nowhere" },
  },
  {
    name: "updateCountry",
    args: `id: "cty-1", name: "Nowhere"`,
    selection: "name",
    expected: { name: "Nowhere" },
  },
  {
    name: "deleteCountry",
    args: `id: "cty-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "cty-1" },
  },

  { name: "createCompany", args: `name: "Acme"`, selection: "name", expected: { name: "Acme" } },
  {
    name: "updateCompany",
    args: `id: "co-1", name: "Acme"`,
    selection: "name",
    expected: { name: "Acme" },
  },
  {
    name: "deleteCompany",
    args: `id: "co-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "co-1" },
  },

  {
    name: "createStock",
    args: `symbol: "ACME"`,
    selection: "symbol",
    expected: { symbol: "ACME" },
  },
  {
    name: "updateStock",
    args: `id: "stk-1", symbol: "ACME"`,
    selection: "symbol",
    expected: { symbol: "ACME" },
  },
  {
    name: "deleteStock",
    args: `id: "stk-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "stk-1" },
  },

  {
    name: "createEvent",
    args: `title: "Meetup"`,
    selection: "title",
    expected: { title: "Meetup" },
  },
  {
    name: "updateEvent",
    args: `id: "evt-1", title: "Meetup"`,
    selection: "title",
    expected: { title: "Meetup" },
  },
  {
    name: "deleteEvent",
    args: `id: "evt-1"`,
    selection: "deleted id",
    expected: { deleted: true, id: "evt-1" },
  },
];

const TIER1_DEMO_MUTATIONS: MutationCase[] = [
  {
    name: "createPost",
    args: `title: "Demo post"`,
    selection: "title",
    expected: { title: "Demo post" },
  },
  {
    name: "updateTodo",
    args: `id: 1, todo: "Demo todo", completed: true`,
    selection: "todo completed",
    expected: { todo: "Demo todo", completed: true },
  },
];

type QueryCase = {
  name: string;
  args: string;
  selection: string;
};

const LIST_QUERIES: QueryCase[] = [
  { name: "users", args: "limit: 1", selection: "firstName" },
  { name: "products", args: "limit: 1", selection: "title" },
  { name: "posts", args: "limit: 1", selection: "title" },
  { name: "comments", args: "limit: 1", selection: "body" },
  { name: "todos", args: "limit: 1", selection: "todo" },
  { name: "carts", args: "limit: 1", selection: "total" },
  { name: "messages", args: "limit: 1", selection: "body" },
  { name: "notifications", args: "limit: 1", selection: "title" },
  { name: "quotes", args: "limit: 1", selection: "content" },
  { name: "recipes", args: "limit: 1", selection: "name" },
  { name: "countries", args: "limit: 1", selection: "name" },
  { name: "companies", args: "limit: 1", selection: "name" },
  { name: "stocks", args: "limit: 1", selection: "symbol" },
  { name: "events", args: "limit: 1", selection: "title" },
];

const SINGULAR_QUERIES: QueryCase[] = [
  { name: "user", args: `id: "1"`, selection: "firstName" },
  { name: "product", args: `id: "1"`, selection: "title" },
  { name: "post", args: `id: "1"`, selection: "title" },
  { name: "comment", args: `id: "1"`, selection: "body" },
  { name: "todo", args: `id: "1"`, selection: "todo" },
  { name: "cart", args: `id: "1"`, selection: "total" },
  { name: "message", args: `id: "1"`, selection: "body" },
  { name: "notification", args: `id: "1"`, selection: "title" },
  { name: "quote", args: `id: "1"`, selection: "content" },
  { name: "recipe", args: `id: "1"`, selection: "name" },
  { name: "country", args: `id: "1"`, selection: "name" },
  { name: "company", args: `id: "1"`, selection: "name" },
  { name: "stock", args: `id: "1"`, selection: "symbol" },
  { name: "event", args: `id: "1"`, selection: "title" },
];

describe("GraphQL CRUD mutations and unused queries", () => {
  describe.each(CRUD_MUTATIONS)("$name", ({ name, args, selection, expected }) => {
    it("invokes the resolver without GraphQL errors", async () => {
      const query = `mutation { ${name}(${args}) { ${selection} } }`;
      const { status, body } = await executeGraphql(query);
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.[name]).toMatchObject(expected);
    });
  });

  describe.each(TIER1_DEMO_MUTATIONS)("$name", ({ name, args, selection, expected }) => {
    it("invokes the resolver without GraphQL errors", async () => {
      const query = `mutation { ${name}(${args}) { ${selection} } }`;
      const { status, body } = await executeGraphql(query);
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.[name]).toMatchObject(expected);
    });
  });

  describe.each(LIST_QUERIES)("list $name", ({ name, args, selection }) => {
    it("returns at least one row", async () => {
      const query = `query { ${name}(${args}) { ${selection} } }`;
      const { status, body } = await executeGraphql(query);
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      const rows = body.data?.[name];
      expect(Array.isArray(rows)).toBe(true);
      expect((rows as Array<Record<string, unknown>>).length).toBeGreaterThan(0);
    });
  });

  describe.each(SINGULAR_QUERIES)("singular $name", ({ name, args, selection }) => {
    it("returns an object with the selected field", async () => {
      const query = `query { ${name}(${args}) { ${selection} } }`;
      const { status, body } = await executeGraphql(query);
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      const row = body.data?.[name] as Record<string, unknown> | null;
      expect(row).toBeTruthy();
      expect(row?.[selection]).toBeDefined();
    });
  });
});
