import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { BunWs } from "./types";
import type { WsData } from "./types";

function makeWs(data: Partial<WsData> = {}): BunWs {
  return {
    send: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    close: vi.fn(),
    data: { route: "ticker", ...data },
  } as unknown as BunWs;
}

describe("tickerWsHandler", () => {
  let tickerWsHandler: typeof import("./ticker").tickerWsHandler;
  let stopTicker: typeof import("./ticker").stopTicker;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ tickerWsHandler, stopTicker } = await import("./ticker"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    stopTicker();
  });

  afterEach(() => {
    stopTicker();
  });

  afterAll(() => {
    stopTicker();
    vi.useRealTimers();
  });

  it("subscribes, tags the topic, and sends an immediate tick on open", () => {
    const ws = makeWs();

    tickerWsHandler.open(ws);

    expect(ws.data.topic).toBe("ticker");
    expect(ws.subscribe).toHaveBeenCalledWith("ticker");
    expect(ws.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(ws.send.mock.calls[0][0]));
    expect(payload).toEqual(
      expect.objectContaining({
        symbol: expect.any(String),
        price: expect.any(Number),
      }),
    );
  });

  it("does not throw when the immediate tick send fails", () => {
    const ws = makeWs();
    ws.send = vi.fn(() => {
      throw new Error("socket closed");
    });

    expect(() => tickerWsHandler.open(ws)).not.toThrow();
  });

  it("broadcasts a tick to connected clients every second", () => {
    const ws = makeWs();
    tickerWsHandler.open(ws);
    expect(ws.send).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    expect(ws.send).toHaveBeenCalledTimes(2);
  });

  it("does not broadcast while no clients are connected", () => {
    const ws = makeWs();
    tickerWsHandler.open(ws);
    const sendsAfterOpen = ws.send.mock.calls.length;

    tickerWsHandler.close(ws);
    vi.advanceTimersByTime(1000);

    expect(ws.send).toHaveBeenCalledTimes(sendsAfterOpen);
  });

  it("unsubscribes the ticker topic on close", () => {
    const ws = makeWs();
    tickerWsHandler.open(ws);

    tickerWsHandler.close(ws);

    expect(ws.unsubscribe).toHaveBeenCalledWith("ticker");
  });

  it("ignores inbound messages because the ticker is server-push only", () => {
    const ws = makeWs();
    tickerWsHandler.open(ws);
    const sendsAfterOpen = ws.send.mock.calls.length;

    tickerWsHandler.message(ws, JSON.stringify({ type: "subscribe" }));

    expect(ws.send).toHaveBeenCalledTimes(sendsAfterOpen);
  });

  it("stopTicker clears the interval so later ticks are not sent", () => {
    const ws = makeWs();
    tickerWsHandler.open(ws);
    const sendsAfterOpen = ws.send.mock.calls.length;

    stopTicker();
    vi.advanceTimersByTime(3000);

    expect(ws.send).toHaveBeenCalledTimes(sendsAfterOpen);
  });
});
