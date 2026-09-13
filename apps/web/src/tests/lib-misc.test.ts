import { describe, it, expect, vi, beforeEach } from "vitest";
import { API_BASE } from "@/lib/api-client";
import { fetchStatsTotal } from "@/lib/stats";
import { io, Manager, Socket } from "@/lib/socket-io-client";

describe("fetchStatsTotal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the numeric total from a successful stats response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total: 42 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchStatsTotal()).resolves.toBe(42);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/stats`, { next: { revalidate: 60 } });
  });

  it("returns null when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ total: 1 }),
      }),
    );

    await expect(fetchStatsTotal()).resolves.toBeNull();
  });

  it("returns null when total is missing or not a number", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ total: "99" }),
      }),
    );

    await expect(fetchStatsTotal()).resolves.toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(fetchStatsTotal()).resolves.toBeNull();
  });
});

describe("socket-io-client re-exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes io, Manager, and Socket from socket.io-client", () => {
    expect(typeof io).toBe("function");
    expect(typeof Manager).toBe("function");
    expect(typeof Socket).toBe("function");
  });
});
