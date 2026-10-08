import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_THROTTLE_KEYS,
  MAX_WS_CONNECTIONS_PER_CLIENT,
  MAX_WS_MESSAGES_PER_WINDOW,
  WS_MESSAGE_WINDOW_MS,
} from "./limits";

type ThrottleModule = typeof import("./throttle");

async function loadThrottle(): Promise<ThrottleModule> {
  vi.resetModules();
  return import("./throttle");
}

describe("nativeClientKey", () => {
  it("uses the native key when address is missing", async () => {
    const { nativeClientKey, NATIVE_WS_CLIENT_KEY, clientKeyFromAddress } = await loadThrottle();
    expect(nativeClientKey(undefined)).toBe(NATIVE_WS_CLIENT_KEY);
    expect(nativeClientKey("   ")).toBe(NATIVE_WS_CLIENT_KEY);
    expect(clientKeyFromAddress("a".repeat(200))).toHaveLength(128);
  });
});

describe("connection throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("admits connections up to the per-client limit", async () => {
    const { admitConnection } = await loadThrottle();
    const key = "client-a";
    for (let index = 0; index < MAX_WS_CONNECTIONS_PER_CLIENT; index += 1) {
      expect(admitConnection(key)).toBe(true);
    }
    expect(admitConnection(key)).toBe(false);
  });

  it("tracks pending opens and releases connections", async () => {
    const { notePendingOpen, consumePendingOpen, admitConnection, releaseConnection } =
      await loadThrottle();
    const key = "pending-client";
    notePendingOpen(key);
    expect(consumePendingOpen(key)).toBe(true);
    expect(consumePendingOpen(key)).toBe(false);
    admitConnection(key);
    releaseConnection(key);
    releaseConnection(key);
  });

  it("refuses new keys when the throttle map is full", async () => {
    const { admitConnection } = await loadThrottle();
    for (let index = 0; index < MAX_THROTTLE_KEYS; index += 1) {
      expect(admitConnection(`fill-${index}`)).toBe(true);
    }
    expect(admitConnection("overflow-key")).toBe(false);
  });
});

describe("message throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows messages until the window limit is reached", async () => {
    const { admitMessage } = await loadThrottle();
    const key = "msg-client";
    for (let index = 0; index < MAX_WS_MESSAGES_PER_WINDOW; index += 1) {
      expect(admitMessage(key)).toBe(true);
    }
    expect(admitMessage(key)).toBe(false);
  });

  it("resets the window after WS_MESSAGE_WINDOW_MS", async () => {
    const { admitMessage } = await loadThrottle();
    const key = "msg-reset";
    for (let index = 0; index < MAX_WS_MESSAGES_PER_WINDOW; index += 1) {
      admitMessage(key);
    }
    expect(admitMessage(key)).toBe(false);
    vi.advanceTimersByTime(WS_MESSAGE_WINDOW_MS);
    expect(admitMessage(key)).toBe(true);
  });

  it("refuses new message keys when the map is full", async () => {
    const { admitMessage } = await loadThrottle();
    for (let index = 0; index < MAX_THROTTLE_KEYS; index += 1) {
      expect(admitMessage(`msg-fill-${index}`)).toBe(true);
    }
    expect(admitMessage("msg-overflow")).toBe(false);
  });
});
