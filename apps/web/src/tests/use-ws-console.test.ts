import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useWsConsole, WS_CONSOLE_MAX_EVENTS } from "@/hooks/use-ws-console";

function mockWebSocket() {
  const instances: MockWebSocket[] = [];

  class MockWebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    url: string;
    readyState = MockWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onmessage: ((ev: { data: string }) => void) | null = null;

    constructor(url: string) {
      this.url = url;
      instances.push(this);
    }

    send = vi.fn();
    close = vi.fn(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.();
    });

    simulateOpen() {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }

    simulateMessage(data: string) {
      this.onmessage?.({ data });
    }

    simulateError() {
      this.onerror?.();
    }
  }

  return { MockWebSocket, instances };
}

describe("useWsConsole", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("connects, receives onmessage into events, disconnect goes idle", () => {
    const { MockWebSocket, instances } = mockWebSocket();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(({ url }) => useWsConsole(url), {
      initialProps: { url: "ws://test/ws" },
    });

    act(() => {
      result.current.connect();
    });

    expect(result.current.status).toBe("connecting");

    const ws = instances[0];
    expect(ws).toBeDefined();

    act(() => {
      ws.simulateOpen();
    });

    expect(result.current.status).toBe("connected");

    act(() => {
      ws.simulateMessage("hello-in");
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]?.direction).toBe("in");
    expect(result.current.events[0]?.message).toBe("hello-in");

    act(() => {
      result.current.disconnect();
    });

    expect(ws.close).toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("send records an outgoing event when open", () => {
    const { MockWebSocket, instances } = mockWebSocket();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(() => useWsConsole("ws://test/ws"));

    act(() => {
      result.current.connect();
    });
    act(() => {
      instances[0]?.simulateOpen();
    });

    act(() => {
      result.current.send("ping");
    });

    expect(instances[0]?.send).toHaveBeenCalledWith("ping");
    expect(result.current.events.some((e) => e.direction === "out" && e.message === "ping")).toBe(
      true,
    );
  });

  it("sets error when url is empty on connect", () => {
    const { MockWebSocket } = mockWebSocket();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(() => useWsConsole("   "));

    act(() => {
      result.current.connect();
    });

    expect(result.current.status).toBe("error");
  });

  it("drops oldest events past the buffer cap", () => {
    const { MockWebSocket, instances } = mockWebSocket();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const { result } = renderHook(() => useWsConsole("ws://test/ws"));

    act(() => {
      result.current.connect();
    });
    act(() => {
      instances[0]?.simulateOpen();
    });

    act(() => {
      for (let i = 0; i < WS_CONSOLE_MAX_EVENTS + 12; i += 1) {
        result.current.send(`m-${i}`);
      }
    });

    expect(result.current.events.length).toBe(WS_CONSOLE_MAX_EVENTS);
    expect(result.current.events[0]?.message).toBe("m-12");
  });

  it("closes the socket on unmount", () => {
    const { MockWebSocket, instances } = mockWebSocket();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const { result, unmount } = renderHook(() => useWsConsole("ws://test/ws"));

    act(() => {
      result.current.connect();
    });
    act(() => {
      instances[0]?.simulateOpen();
    });

    const ws = instances[0];
    unmount();

    expect(ws?.close).toHaveBeenCalled();
  });
});
