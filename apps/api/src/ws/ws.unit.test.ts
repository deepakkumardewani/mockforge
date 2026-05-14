import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleWsUpgrade } from "./index";
import { DEFAULT_WS_PARAMS } from "./types";

// Minimal mock for Bun.Server
function makeServer(upgraded: boolean) {
  return {
    upgrade: vi.fn(() => upgraded),
    publish: vi.fn(),
  } as unknown as import("bun").Server<import("./types").WsData>;
}

describe("handleWsUpgrade", () => {
  it("upgrades /ws/stats", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/ws/stats", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(server.upgrade).toHaveBeenCalled();
    expect(res).toBeUndefined();
  });

  it("upgrades /ws/notifications", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/ws/notifications", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(server.upgrade).toHaveBeenCalled();
    expect(res).toBeUndefined();
  });

  it("upgrades /ws/ticker", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/ws/ticker", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(server.upgrade).toHaveBeenCalled();
    expect(res).toBeUndefined();
  });

  it("upgrades /ws/chat/:roomId and extracts roomId", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/ws/chat/room-123", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(server.upgrade).toHaveBeenCalledWith(req, {
      data: { route: "chat", roomId: "room-123" },
    });
    expect(res).toBeUndefined();
  });

  it("returns 500 when upgrade fails", () => {
    const server = makeServer(false);
    const req = new Request("http://localhost:4000/ws/stats", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(res?.status).toBe(500);
  });

  it("returns null for non-ws paths (fall through to Hono)", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/api/products");
    const res = handleWsUpgrade(req, server);
    expect(res).toBeNull();
    expect(server.upgrade).not.toHaveBeenCalled();
  });
});

describe("DEFAULT_WS_PARAMS", () => {
  it("has required PaginationParams fields", () => {
    expect(DEFAULT_WS_PARAMS.limit).toBe(1);
    expect(DEFAULT_WS_PARAMS.skip).toBe(0);
    expect(DEFAULT_WS_PARAMS.order).toBe("asc");
  });
});
