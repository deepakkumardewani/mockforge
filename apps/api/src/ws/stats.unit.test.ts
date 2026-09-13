import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { BunWs } from "./types";
import type { WsData } from "./types";

const mockGet = vi.fn();

vi.mock("../db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
  }),
}));

function makeWs(data: Partial<WsData> = {}): BunWs {
  return {
    send: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    close: vi.fn(),
    data: { route: "stats", ...data },
  } as unknown as BunWs;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("statsWsHandler", () => {
  let statsWsHandler: typeof import("./stats").statsWsHandler;
  let stopBroadcast: typeof import("./stats").stopBroadcast;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ statsWsHandler, stopBroadcast } = await import("./stats"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockGet.mockResolvedValue("12");
    stopBroadcast();
  });

  afterEach(() => {
    stopBroadcast();
  });

  afterAll(() => {
    stopBroadcast();
    vi.useRealTimers();
  });

  it("pushes the redis request total when a client opens", async () => {
    const ws = makeWs();

    statsWsHandler.open(ws);
    await flushMicrotasks();

    expect(mockGet).toHaveBeenCalledWith("stats:total_requests");
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ total: 12 }));
  });

  it("treats a missing redis key as a total of zero", async () => {
    mockGet.mockResolvedValue(null);
    const ws = makeWs();

    statsWsHandler.open(ws);
    await flushMicrotasks();

    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ total: 0 }));
  });

  it("swallows redis errors so open still succeeds", async () => {
    mockGet.mockRejectedValue(new Error("redis down"));
    const ws = makeWs();

    expect(() => statsWsHandler.open(ws)).not.toThrow();
    await flushMicrotasks();

    expect(ws.send).not.toHaveBeenCalledWith(expect.stringContaining("total"));
  });

  it("broadcasts the total every two seconds", async () => {
    const ws = makeWs();
    statsWsHandler.open(ws);
    await flushMicrotasks();
    mockGet.mockClear();
    ws.send.mockClear();
    mockGet.mockResolvedValue("99");

    vi.advanceTimersByTime(2000);
    await flushMicrotasks();

    expect(mockGet).toHaveBeenCalledWith("stats:total_requests");
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ total: 99 }));
  });

  it("drops a client that throws on send during broadcast", async () => {
    const healthy = makeWs();
    const broken = makeWs();
    statsWsHandler.open(healthy);
    statsWsHandler.open(broken);
    await flushMicrotasks();
    healthy.send.mockClear();
    broken.send.mockImplementation(() => {
      throw new Error("gone");
    });
    broken.send.mockClear();
    healthy.send.mockClear();
    mockGet.mockResolvedValue("7");

    vi.advanceTimersByTime(2000);
    await flushMicrotasks();

    expect(healthy.send).toHaveBeenCalledWith(JSON.stringify({ total: 7 }));
    expect(broken.send).toHaveBeenCalledTimes(1);

    healthy.send.mockClear();
    vi.advanceTimersByTime(2000);
    await flushMicrotasks();

    expect(broken.send).toHaveBeenCalledTimes(1);
    expect(healthy.send).toHaveBeenCalledWith(JSON.stringify({ total: 7 }));
  });

  it("sends ping after the heartbeat interval", () => {
    const ws = makeWs();
    statsWsHandler.open(ws);
    ws.send.mockClear();

    vi.advanceTimersByTime(30_000);

    expect(ws.send).toHaveBeenCalledWith("ping");
  });

  it("closes the socket when the pong timeout elapses", () => {
    const ws = makeWs();
    statsWsHandler.open(ws);

    vi.advanceTimersByTime(40_000);

    expect(ws.close).toHaveBeenCalledWith(1001, "ping timeout");
  });

  it("reschedules the heartbeat after a pong", () => {
    const ws = makeWs();
    statsWsHandler.open(ws);

    vi.advanceTimersByTime(30_000);
    statsWsHandler.message(ws, "pong");
    ws.close.mockClear();

    vi.advanceTimersByTime(39_999);
    expect(ws.close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(ws.close).toHaveBeenCalledWith(1001, "ping timeout");
  });

  it("ignores inbound messages other than pong", () => {
    const ws = makeWs();
    statsWsHandler.open(ws);
    const timeoutBefore = ws.data.pingTimeout;

    statsWsHandler.message(ws, "hello");

    expect(ws.data.pingTimeout).toBe(timeoutBefore);
  });

  it("clears the heartbeat timeout on close", () => {
    const ws = makeWs();
    statsWsHandler.open(ws);

    statsWsHandler.close(ws);
    vi.advanceTimersByTime(40_000);

    expect(ws.close).not.toHaveBeenCalled();
  });

  it("stopBroadcast prevents further redis polls", async () => {
    const ws = makeWs();
    statsWsHandler.open(ws);
    await flushMicrotasks();
    mockGet.mockClear();

    stopBroadcast();
    vi.advanceTimersByTime(4000);
    await flushMicrotasks();

    expect(mockGet).not.toHaveBeenCalled();
  });
});
