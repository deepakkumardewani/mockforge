import { describe, it, expect, beforeEach, vi } from "vitest";

const mockIncr = vi.fn();

vi.mock("../db/redis", () => ({
  getRedis: () => ({
    incr: mockIncr,
  }),
}));

import {
  STATS_KEY,
  incrementRequestCounter,
  isCountableHttpPath,
  isCountableWsPath,
} from "./increment-counter";

describe("isCountableHttpPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for /health", () => {
    expect(isCountableHttpPath("/health")).toBe(false);
  });

  it("returns false for /api/stats", () => {
    expect(isCountableHttpPath("/api/stats")).toBe(false);
  });

  it("returns true for /graphql", () => {
    expect(isCountableHttpPath("/graphql")).toBe(true);
  });

  it("returns true for paths under /api/", () => {
    expect(isCountableHttpPath("/api/users")).toBe(true);
  });

  it("returns false for /graphql nested paths", () => {
    expect(isCountableHttpPath("/graphql/playground")).toBe(false);
  });

  it("returns false for non-api paths", () => {
    expect(isCountableHttpPath("/docs")).toBe(false);
  });
});

describe("isCountableWsPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for /ws/stats", () => {
    expect(isCountableWsPath("/ws/stats")).toBe(false);
  });

  it("returns true for other /ws/ paths", () => {
    expect(isCountableWsPath("/ws/ticker")).toBe(true);
  });

  it("returns false when the path does not start with /ws/", () => {
    expect(isCountableWsPath("/ws")).toBe(false);
  });
});

describe("incrementRequestCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments the Redis stats key on success", async () => {
    mockIncr.mockResolvedValueOnce(12);

    incrementRequestCounter();

    await vi.waitFor(() => {
      expect(mockIncr).toHaveBeenCalledWith(STATS_KEY);
    });
  });

  it("logs and swallows Redis increment failures", async () => {
    const redisError = new Error("redis unavailable");
    mockIncr.mockRejectedValueOnce(redisError);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    incrementRequestCounter();

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "[RequestCounter] Failed to increment counter:",
        redisError,
      );
    });

    consoleError.mockRestore();
  });
});
