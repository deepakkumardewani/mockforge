import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { BunWs } from "./types";
import type { WsData } from "./types";

function makeWs(data: Partial<WsData> = {}): BunWs {
  return {
    send: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    close: vi.fn(),
    data: { route: "notifications", ...data },
  } as unknown as BunWs;
}

describe("notificationsWsHandler", () => {
  let notificationsWsHandler: typeof import("./notifications").notificationsWsHandler;
  let stopNotifications: typeof import("./notifications").stopNotifications;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ notificationsWsHandler, stopNotifications } = await import("./notifications"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    stopNotifications();
  });

  afterEach(() => {
    stopNotifications();
  });

  afterAll(() => {
    stopNotifications();
    vi.useRealTimers();
  });

  it("sends an immediate notification on open", () => {
    const ws = makeWs();

    notificationsWsHandler.open(ws);

    expect(ws.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(ws.send.mock.calls[0][0]));
    expect(payload).toEqual(expect.any(Object));
  });

  it("does not throw when the first send fails", () => {
    const ws = makeWs();
    ws.send = vi.fn(() => {
      throw new Error("socket closed");
    });

    expect(() => notificationsWsHandler.open(ws)).not.toThrow();
  });

  it("broadcasts a notification every two seconds while clients are connected", () => {
    const ws = makeWs();
    notificationsWsHandler.open(ws);
    expect(ws.send).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);

    expect(ws.send).toHaveBeenCalledTimes(2);
  });

  it("skips scheduled broadcasts when no clients remain", () => {
    const ws = makeWs();
    notificationsWsHandler.open(ws);
    const sendsAfterOpen = ws.send.mock.calls.length;

    notificationsWsHandler.close(ws);
    vi.advanceTimersByTime(2000);

    expect(ws.send).toHaveBeenCalledTimes(sendsAfterOpen);
  });

  it("clears per-socket timers on close", () => {
    const ws = makeWs();
    notificationsWsHandler.open(ws);
    const emitTimer = setTimeout(() => {
      ws.send("stale-emit");
    }, 5000);
    const pingTimeout = setTimeout(() => {
      ws.send("stale-ping");
    }, 5000);
    ws.data.emitTimer = emitTimer;
    ws.data.pingTimeout = pingTimeout;

    notificationsWsHandler.close(ws);
    vi.advanceTimersByTime(5000);

    expect(ws.send).not.toHaveBeenCalledWith("stale-emit");
    expect(ws.send).not.toHaveBeenCalledWith("stale-ping");
  });

  it("ignores inbound messages because the stream is server-push only", () => {
    const ws = makeWs();
    notificationsWsHandler.open(ws);
    const sendsAfterOpen = ws.send.mock.calls.length;

    notificationsWsHandler.message(ws, "ack");

    expect(ws.send).toHaveBeenCalledTimes(sendsAfterOpen);
  });

  it("stopNotifications clears the interval so later emits are not sent", () => {
    const ws = makeWs();
    notificationsWsHandler.open(ws);
    const sendsAfterOpen = ws.send.mock.calls.length;

    stopNotifications();
    vi.advanceTimersByTime(4000);

    expect(ws.send).toHaveBeenCalledTimes(sendsAfterOpen);
  });
});
