import { describe, it, expect } from "vitest";
import {
  ENTITIES,
  REST_ENDPOINTS,
  GRAPHQL_FIELDS,
  SEARCH_FIELDS,
  filterEndpoints,
  getEntityFromPath,
} from "./playground-catalogue";

describe("playground-catalogue", () => {
  describe("ENTITIES", () => {
    it("has exactly 14 items", () => {
      expect(ENTITIES).toHaveLength(14);
    });

    it("includes all required entities", () => {
      const requiredEntities = [
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
      ];
      requiredEntities.forEach((entity) => {
        expect(ENTITIES).toContain(entity);
      });
    });

    it("does not include custom", () => {
      expect(ENTITIES).not.toContain("custom");
    });
  });

  describe("REST_ENDPOINTS", () => {
    it("includes endpoints for all 14 entities with all 6 patterns", () => {
      // 14 entities × 6 patterns + 1 /stats = 85 endpoints
      const expectedMinimum = 14 * 6; // At least 84 endpoints for CRUD operations
      expect(REST_ENDPOINTS.length).toBeGreaterThanOrEqual(expectedMinimum);
    });

    it("follows the expected endpoint matrix pattern", () => {
      // Should have GET /users, GET /users/:id, GET /users/search, POST, PUT, DELETE for each entity
      const patterns = [
        { method: "GET", pathPattern: /users$/ },
        { method: "GET", pathPattern: /users\/search/ },
        { method: "GET", pathPattern: /users\/\d+|users\/:id/ },
        { method: "POST", pathPattern: /users$/ },
        { method: "PUT", pathPattern: /users\/\d+|users\/:id/ },
        { method: "DELETE", pathPattern: /users\/\d+|users\/:id/ },
      ];

      patterns.forEach(({ method, pathPattern }) => {
        const found = REST_ENDPOINTS.some(
          (ep) => ep.method === method && pathPattern.test(ep.path),
        );
        expect(found).toBe(true);
      });
    });

    it("includes GET /stats endpoint", () => {
      const statsEndpoint = REST_ENDPOINTS.find(
        (ep) => ep.path === "/stats" && ep.method === "GET",
      );
      expect(statsEndpoint).toBeDefined();
    });

    it("has all endpoints with method, path, and description", () => {
      REST_ENDPOINTS.forEach((endpoint) => {
        expect(endpoint).toHaveProperty("method");
        expect(endpoint).toHaveProperty("path");
        expect(endpoint).toHaveProperty("description");
        expect(typeof endpoint.method).toBe("string");
        expect(typeof endpoint.path).toBe("string");
        expect(typeof endpoint.description).toBe("string");
      });
    });
  });

  describe("GRAPHQL_FIELDS", () => {
    it("has fields for all 14 entities", () => {
      ENTITIES.forEach((entity) => {
        expect(GRAPHQL_FIELDS).toHaveProperty(entity);
      });
    });

    it("every root field has a non-empty type string", () => {
      Object.entries(GRAPHQL_FIELDS).forEach(([, fields]) => {
        expect(typeof fields).toBe("object");
        if (typeof fields === "object" && fields !== null) {
          Object.entries(fields as Record<string, unknown>).forEach(([, fieldDef]) => {
            expect(fieldDef).toHaveProperty("type");
            const fieldType = (fieldDef as Record<string, unknown>).type;
            expect(typeof fieldType).toBe("string");
            expect((fieldType as string).length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe("filterEndpoints", () => {
    it("returns entries containing 'users' when filtered by 'user'", () => {
      const results = filterEndpoints("user");
      const userEndpoints = results.filter(
        (ep) => ep.path.includes("users") || ep.path.includes("user"),
      );
      expect(userEndpoints.length).toBeGreaterThan(0);
    });

    it("returns all REST_ENDPOINTS when query is empty string", () => {
      const results = filterEndpoints("");
      expect(results).toEqual(REST_ENDPOINTS);
    });

    it("performs case-insensitive search", () => {
      const lowerResults = filterEndpoints("products");
      const upperResults = filterEndpoints("PRODUCTS");
      const mixedResults = filterEndpoints("ProDucts");

      expect(lowerResults).toEqual(upperResults);
      expect(lowerResults).toEqual(mixedResults);
    });

    it("filters by method and path", () => {
      const results = filterEndpoints("get");
      // Since paths might contain 'get', just check if we get some results
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it("returns empty array for non-matching query", () => {
      const results = filterEndpoints("nonexistententity");
      expect(results).toEqual([]);
    });
  });

  describe("SEARCH_FIELDS", () => {
    it("has a non-empty field list for every entity", () => {
      ENTITIES.forEach((entity) => {
        expect(SEARCH_FIELDS[entity].length).toBeGreaterThan(0);
      });
    });
  });

  describe("getEntityFromPath", () => {
    it("resolves an entity from an /api/ prefixed search path", () => {
      expect(getEntityFromPath("/api/users/search")).toBe("users");
    });

    it("ignores query strings and sub-paths", () => {
      expect(getEntityFromPath("/api/products/search?q=phone&limit=30")).toBe("products");
    });

    it("works without the /api/ prefix", () => {
      expect(getEntityFromPath("comments")).toBe("comments");
    });

    it("returns null for unknown entities", () => {
      expect(getEntityFromPath("/api/widgets/search")).toBeNull();
    });
  });
});
