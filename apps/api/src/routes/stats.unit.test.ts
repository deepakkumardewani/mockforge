import { describe, it, expect, beforeEach, vi } from "vitest";

const mockGet = vi.fn();

vi.mock("../db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
  }),
}));

import statsApp from "./stats";

describe("GET /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the parsed Redis counter when get returns a number string", async () => {
    mockGet.mockResolvedValueOnce("1842");

    const res = await statsApp.request("/api/stats");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ total: 1842 });
    expect(mockGet).toHaveBeenCalledWith("stats:total_requests");
  });

  it("returns total 0 when Redis get returns null", async () => {
    mockGet.mockResolvedValueOnce(null);

    const res = await statsApp.request("/api/stats");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ total: 0 });
  });

  it("returns 500 when Redis get throws", async () => {
    const redisError = new Error("upstash timeout");
    mockGet.mockRejectedValueOnce(redisError);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await statsApp.request("/api/stats");
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch stats",
      },
    });
    expect(consoleError).toHaveBeenCalledWith("[Stats] Error fetching stats:", redisError);

    consoleError.mockRestore();
  });
});
