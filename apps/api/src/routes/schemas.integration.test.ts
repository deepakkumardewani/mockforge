import { describe, it, expect, beforeAll } from "vitest";
import { Hono } from "hono";
import { initializeRedis, getRedis } from "../db/redis";
import { mfIdMiddleware } from "../middleware/mf-id";
import schemasRouter from "./schemas";
import customRouter from "./rest/custom";

function createApp() {
  const app = new Hono();
  app.use("*", mfIdMiddleware);
  app.route("/api/schemas", schemasRouter);
  app.route("/api/custom", customRouter);
  return app;
}

const flightSchemaBody = {
  name: "Flight",
  fields: [
    { name: "origin", type: "enum", values: ["JFK", "LAX", "ORD"] },
    { name: "destination", type: "enum", values: ["LHR", "CDG", "NRT"] },
    { name: "price", type: "number", min: 100, max: 2000 },
    { name: "status", type: "enum", values: ["on-time", "delayed", "cancelled"] },
  ],
  persistent: true,
};

describe("Schema REST Routes", () => {
  const testMfId = "test-mfid-routes";

  beforeAll(() => {
    initializeRedis();
  });

  it("should create a schema via POST /api/schemas", async () => {
    const app = createApp();
    const res = await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify(flightSchemaBody),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("slug");
    expect(json).toHaveProperty("endpoint");
    expect(json.endpoint).toContain("/api/custom/");
  });

  it("should list schemas for an mfId", async () => {
    const app = createApp();
    // Create one first
    await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify(flightSchemaBody),
    });

    const res = await app.request("/api/schemas", {
      method: "GET",
      headers: { "x-mf-id": testMfId },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("should reject invalid schema with 400", async () => {
    const app = createApp();
    const res = await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify({ name: "Bad", fields: [{ name: "bad", type: "unknown" }] }),
    });

    expect(res.status).toBe(400);
  });

  it("should fetch generated data from custom endpoint", async () => {
    const app = createApp();
    const createRes = await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify(flightSchemaBody),
    });
    const { slug } = await createRes.json();

    const res = await app.request(`/api/custom/${slug}?limit=3`, {
      method: "GET",
      headers: { "x-mf-id": testMfId },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(json.data).toHaveLength(3);
    expect(json.data[0]).toHaveProperty("origin");
    expect(json.data[0]).toHaveProperty("destination");
    expect(json.data[0]).toHaveProperty("price");
  });

  it("should fetch single record from custom endpoint", async () => {
    const app = createApp();
    const createRes = await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify(flightSchemaBody),
    });
    const { slug } = await createRes.json();

    const res = await app.request(`/api/custom/${slug}/any-id`, {
      method: "GET",
      headers: { "x-mf-id": testMfId },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(json.data).toHaveProperty("id");
    expect(json.data).toHaveProperty("origin");
  });

  it("should return 404 for non-existent custom schema", async () => {
    const app = createApp();
    const res = await app.request("/api/custom/nonexistent", {
      method: "GET",
      headers: { "x-mf-id": testMfId },
    });

    expect(res.status).toBe(404);
  });

  it("should delete a schema owned by the same mfId", async () => {
    const app = createApp();
    const createRes = await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify(flightSchemaBody),
    });
    const { slug } = await createRes.json();

    const res = await app.request(`/api/schemas/${slug}`, {
      method: "DELETE",
      headers: { "x-mf-id": testMfId },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(true);
  });

  it("should return 404 when deleting with wrong mfId", async () => {
    const app = createApp();
    const createRes = await app.request("/api/schemas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mf-id": testMfId,
      },
      body: JSON.stringify(flightSchemaBody),
    });
    const { slug } = await createRes.json();

    const res = await app.request(`/api/schemas/${slug}`, {
      method: "DELETE",
      headers: { "x-mf-id": "different-mf-id" },
    });

    expect(res.status).toBe(404);
  });
});
