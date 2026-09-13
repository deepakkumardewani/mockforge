import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleWsUpgrade, websocketHandlers } from "./index";
import { DEFAULT_WS_PARAMS } from "./types";
import { incrementRequestCounter } from "../stats/increment-counter";
import { statsWsHandler } from "./stats";
import { notificationsWsHandler } from "./notifications";
import { chatWsHandler } from "./chat";
import { tickerWsHandler } from "./ticker";

vi.mock("../stats/increment-counter", () => ({
  incrementRequestCounter: vi.fn(),
}));

vi.mock("./stats", () => ({
  statsWsHandler: { open: vi.fn(), close: vi.fn(), message: vi.fn() },
}));

vi.mock("./notifications", () => ({
  notificationsWsHandler: { open: vi.fn(), close: vi.fn(), message: vi.fn() },
}));

vi.mock("./chat", () => ({
  chatWsHandler: { open: vi.fn(), close: vi.fn(), message: vi.fn() },
}));

vi.mock("./ticker", () => ({
  tickerWsHandler: { open: vi.fn(), close: vi.fn(), message: vi.fn() },
}));

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

  it("upgrades /ws/chat to the default room", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/ws/chat", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(server.upgrade).toHaveBeenCalledWith(req, {
      data: { route: "chat", roomId: "default" },
    });
    expect(res).toBeUndefined();
  });

  it("upgrades /ws/chat/ trailing slash to the default room", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/ws/chat/", {
      headers: { upgrade: "websocket" },
    });
    const res = handleWsUpgrade(req, server);
    expect(server.upgrade).toHaveBeenCalledWith(req, {
      data: { route: "chat", roomId: "default" },
    });
    expect(res).toBeUndefined();
  });

  it.each(["/ws/stats", "/ws/notifications", "/ws/ticker", "/ws/chat", "/ws/chat/room-9"])(
    "returns 500 when upgrade fails for %s",
    (path) => {
      const server = makeServer(false);
      const req = new Request(`http://localhost:4000${path}`, {
        headers: { upgrade: "websocket" },
      });
      const res = handleWsUpgrade(req, server);
      expect(res?.status).toBe(500);
    },
  );

  it("returns null for non-ws paths (fall through to Hono)", () => {
    const server = makeServer(true);
    const req = new Request("http://localhost:4000/api/products");
    const res = handleWsUpgrade(req, server);
    expect(res).toBeNull();
    expect(server.upgrade).not.toHaveBeenCalled();
  });
});

describe("websocketHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["stats", "notifications", "chat", "ticker"] as const)(
    "dispatches open/close/message for %s",
    (route) => {
      const ws = { data: { route, roomId: route === "chat" ? "lobby" : undefined } };
      const msg = "ping";

      websocketHandlers.open!(ws as never);
      websocketHandlers.message!(ws as never, msg);
      websocketHandlers.close!(ws as never, 1000, "done");

      if (route === "stats") {
        expect(statsWsHandler.open).toHaveBeenCalledWith(ws);
        expect(statsWsHandler.message).toHaveBeenCalledWith(ws, msg);
        expect(statsWsHandler.close).toHaveBeenCalledWith(ws);
        expect(incrementRequestCounter).not.toHaveBeenCalled();
      }
      if (route === "notifications") {
        expect(notificationsWsHandler.open).toHaveBeenCalledWith(ws);
        expect(notificationsWsHandler.message).toHaveBeenCalledWith(ws, msg);
        expect(notificationsWsHandler.close).toHaveBeenCalledWith(ws);
        expect(incrementRequestCounter).toHaveBeenCalledTimes(1);
      }
      if (route === "chat") {
        expect(chatWsHandler.open).toHaveBeenCalledWith(ws, "lobby");
        expect(chatWsHandler.message).toHaveBeenCalledWith(ws, msg);
        expect(chatWsHandler.close).toHaveBeenCalledWith(ws);
        expect(incrementRequestCounter).toHaveBeenCalledTimes(1);
      }
      if (route === "ticker") {
        expect(tickerWsHandler.open).toHaveBeenCalledWith(ws);
        expect(tickerWsHandler.message).toHaveBeenCalledWith(ws, msg);
        expect(tickerWsHandler.close).toHaveBeenCalledWith(ws);
        expect(incrementRequestCounter).toHaveBeenCalledTimes(1);
      }
    },
  );

  it("uses default chat room when roomId is missing", () => {
    const ws = { data: { route: "chat" as const } };
    websocketHandlers.open!(ws as never);
    expect(chatWsHandler.open).toHaveBeenCalledWith(ws, "default");
  });
});

describe("DEFAULT_WS_PARAMS", () => {
  it("has required PaginationParams fields", () => {
    expect(DEFAULT_WS_PARAMS.limit).toBe(1);
    expect(DEFAULT_WS_PARAMS.skip).toBe(0);
    expect(DEFAULT_WS_PARAMS.order).toBe("asc");
  });
});
