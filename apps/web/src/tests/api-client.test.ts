import { describe, it, expect, vi, beforeEach } from "vitest";

describe("apiClient", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("adds X-MF-ID header when mfId is provided", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    } as Response);

    const { apiClient } = await import("@/lib/api-client");
    await apiClient("/api/test", {}, "test-id-123");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-MF-ID": "test-id-123",
        }),
      }),
    );
  });

  it("does not add X-MF-ID header when mfId is null", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    } as Response);

    const { apiClient } = await import("@/lib/api-client");
    await apiClient("/api/test", {});

    const callHeaders = vi.mocked(global.fetch).mock.calls[0][1]?.headers;
    expect((callHeaders as Record<string, string>)["X-MF-ID"]).toBeUndefined();
  });

  it("throws ApiError on non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: () =>
        Promise.resolve({ error: { message: "Rate limit exceeded" } }),
    } as Response);

    const { apiClient, ApiError } = await import("@/lib/api-client");

    await expect(apiClient("/api/test")).rejects.toThrow(ApiError);
  });

  it("throws with error message from response body", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: () =>
        Promise.resolve({ error: { message: "Rate limit exceeded" } }),
    } as Response);

    const { apiClient } = await import("@/lib/api-client");

    await expect(apiClient("/api/test")).rejects.toThrow("Rate limit exceeded");
  });
});
