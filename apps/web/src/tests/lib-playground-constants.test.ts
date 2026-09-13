import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MF_ID_HEADER,
  REST_API_PREFIX,
  DEFAULT_API_BASE_URL,
  DEFAULT_SOCKETIO_BASE_URL,
  MF_ID_STORAGE_KEY,
  SCHEMA_SIDEBAR_STORAGE_KEY,
  toWebSocketOrigin,
} from "@/lib/playground-constants";
import { DEFAULT_SOCKETIO_URL, getSocketIoBaseUrl } from "@/lib/playground-env";

describe("playground constants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes identity, REST, and storage constants", () => {
    expect(MF_ID_HEADER).toBe("X-MF-ID");
    expect(REST_API_PREFIX).toBe("/api/");
    expect(DEFAULT_API_BASE_URL).toBe("http://localhost:4000");
    expect(DEFAULT_SOCKETIO_BASE_URL).toBe(DEFAULT_SOCKETIO_URL);
    expect(DEFAULT_SOCKETIO_URL).toBe("http://localhost:4001");
    expect(MF_ID_STORAGE_KEY).toBe("mf_id");
    expect(SCHEMA_SIDEBAR_STORAGE_KEY).toBe("mf_schema_sidebar_open");
  });

  it("maps http origins to ws and strips a trailing slash", () => {
    expect(toWebSocketOrigin("http://localhost:4000/")).toBe("ws://localhost:4000");
  });

  it("maps https origins to wss", () => {
    expect(toWebSocketOrigin("https://api.example.com")).toBe("wss://api.example.com");
  });
});

describe("getSocketIoBaseUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the default when the env var is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SOCKETIO_URL", "");
    expect(getSocketIoBaseUrl()).toBe(DEFAULT_SOCKETIO_URL);
  });

  it("returns a trimmed custom Socket.IO URL from the env", () => {
    vi.stubEnv("NEXT_PUBLIC_SOCKETIO_URL", "  https://sio.example.com  ");
    expect(getSocketIoBaseUrl()).toBe("https://sio.example.com");
  });

  it("falls back when the env value is only whitespace", () => {
    vi.stubEnv("NEXT_PUBLIC_SOCKETIO_URL", "   ");
    expect(getSocketIoBaseUrl()).toBe(DEFAULT_SOCKETIO_URL);
  });
});
