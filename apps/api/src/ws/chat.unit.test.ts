import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { BunWs } from "./types";
import type { WsData } from "./types";

function makeWs(data: Partial<WsData> = {}): BunWs {
  return {
    send: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    close: vi.fn(),
    data: { route: "chat", ...data },
  } as unknown as BunWs;
}

describe("chatWsHandler", () => {
  let chatWsHandler: typeof import("./chat").chatWsHandler;
  const openSockets: BunWs[] = [];

  function openChat(ws: BunWs, roomId: string): BunWs {
    chatWsHandler.open(ws, roomId);
    openSockets.push(ws);
    return ws;
  }

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ chatWsHandler } = await import("./chat"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    while (openSockets.length > 0) {
      const ws = openSockets.pop();
      if (ws) chatWsHandler.close(ws);
    }
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("subscribes to the room topic and sends a welcome message on open", () => {
    const ws = makeWs();

    openChat(ws, "lobby");

    expect(ws.data.roomId).toBe("lobby");
    expect(ws.subscribe).toHaveBeenCalledWith("chat:lobby");
    expect(ws.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(ws.send.mock.calls[0][0]));
    expect(payload.roomId).toBe("lobby");
  });

  it("does not throw when the welcome send fails", () => {
    const ws = makeWs();
    ws.send = vi.fn(() => {
      throw new Error("socket closed");
    });

    expect(() => openChat(ws, "lobby")).not.toThrow();
  });

  it("publishes a parsed chat message to the same room", () => {
    const alice = makeWs();
    const bob = makeWs();
    openChat(alice, "lobby");
    openChat(bob, "lobby");
    alice.send.mockClear();
    bob.send.mockClear();

    chatWsHandler.message(alice, JSON.stringify({ id: "msg-1", text: "hello" }));

    expect(alice.send).toHaveBeenCalledWith(JSON.stringify({ id: "msg-1", text: "hello" }));
    expect(bob.send).toHaveBeenCalledWith(JSON.stringify({ id: "msg-1", text: "hello" }));
  });

  it("publishes a delayed reply that references the inbound message id", () => {
    const ws = makeWs();
    openChat(ws, "lobby");
    ws.send.mockClear();

    chatWsHandler.message(ws, JSON.stringify({ id: "msg-1", text: "hello" }));
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ id: "msg-1", text: "hello" }));

    vi.advanceTimersByTime(1000);

    const replyCall = ws.send.mock.calls.find((call) => {
      try {
        return JSON.parse(String(call[0])).replyTo === "msg-1";
      } catch {
        return false;
      }
    });
    expect(replyCall).toBeDefined();
    expect(JSON.parse(String(replyCall?.[0])).roomId).toBe("lobby");
  });

  it("sets replyTo to null when the inbound payload has no id", () => {
    const ws = makeWs();
    openChat(ws, "lobby");
    ws.send.mockClear();

    chatWsHandler.message(ws, JSON.stringify({ text: "no-id" }));
    vi.advanceTimersByTime(1000);

    const replyCall = ws.send.mock.calls.find((call) => {
      try {
        return Object.hasOwn(JSON.parse(String(call[0])), "replyTo");
      } catch {
        return false;
      }
    });
    expect(JSON.parse(String(replyCall?.[0])).replyTo).toBeNull();
  });

  it("accepts a Buffer payload the same way as a string", () => {
    const ws = makeWs();
    openChat(ws, "lobby");
    ws.send.mockClear();

    chatWsHandler.message(ws, Buffer.from(JSON.stringify({ id: "buf-1", text: "from-buffer" })));

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ id: "buf-1", text: "from-buffer" }));
  });

  it("ignores invalid JSON and does not publish a reply", () => {
    const ws = makeWs();
    openChat(ws, "lobby");
    ws.send.mockClear();

    chatWsHandler.message(ws, "not-json{");

    expect(ws.send).not.toHaveBeenCalled();
  });

  it("does not leak a message into a different room", () => {
    const lobby = makeWs();
    const other = makeWs();
    openChat(lobby, "lobby");
    openChat(other, "ops");
    lobby.send.mockClear();
    other.send.mockClear();

    chatWsHandler.message(lobby, JSON.stringify({ id: "msg-2", text: "room-only" }));

    expect(lobby.send).toHaveBeenCalled();
    expect(other.send).not.toHaveBeenCalled();
  });

  it("emits scheduled room noise to connected rooms every three seconds", () => {
    const ws = makeWs();
    openChat(ws, "lobby");
    ws.send.mockClear();

    vi.advanceTimersByTime(3000);

    expect(ws.send).toHaveBeenCalled();
    const noise = JSON.parse(String(ws.send.mock.calls[0][0]));
    expect(noise.roomId).toBe("lobby");
  });

  it("unsubscribes the room topic and clears timers on close", () => {
    const ws = makeWs();
    openChat(ws, "lobby");
    const emitTimer = setTimeout(() => {
      ws.send("stale-emit");
    }, 5000);
    const pingTimeout = setTimeout(() => {
      ws.send("stale-ping");
    }, 5000);
    ws.data.emitTimer = emitTimer;
    ws.data.pingTimeout = pingTimeout;

    chatWsHandler.close(ws);
    vi.advanceTimersByTime(5000);

    expect(ws.unsubscribe).toHaveBeenCalledWith("chat:lobby");
    expect(ws.send).not.toHaveBeenCalledWith("stale-emit");
    expect(ws.send).not.toHaveBeenCalledWith("stale-ping");
  });
});
