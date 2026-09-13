import { describe, it, expect, beforeEach, vi } from "vitest";
import type { BunServer } from "./types";

describe("server-ref", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("throws when getServer is called before setServer", async () => {
    const { getServer } = await import("./server-ref");

    expect(() => getServer()).toThrow("Bun server not yet initialised");
  });

  it("returns the server instance after setServer", async () => {
    const { getServer, setServer } = await import("./server-ref");
    const server = { hostname: "localhost" } as unknown as BunServer;

    setServer(server);

    expect(getServer()).toBe(server);
  });

  it("replaces a previously stored server", async () => {
    const { getServer, setServer } = await import("./server-ref");
    const first = { hostname: "first" } as unknown as BunServer;
    const second = { hostname: "second" } as unknown as BunServer;

    setServer(first);
    setServer(second);

    expect(getServer()).toBe(second);
  });
});
