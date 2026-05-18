import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSocketIoConsole } from "@/hooks/use-socketio-console";

const ioMock = vi.fn();

vi.mock("@/lib/socket-io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}));

function createListenersSocket(listenEvent: string) {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  const socket = {
    connected: false,
    on: vi.fn((ev: string, fn: (...args: unknown[]) => void) => {
      (listeners[ev] ??= []).push(fn);
    }),
    emit: vi.fn(),
    disconnect: vi.fn(() => {
      socket.connected = false;
      for (const fn of listeners.disconnect ?? []) fn("io disconnect");
    }),
    simulateConnect() {
      socket.connected = true;
      for (const fn of listeners.connect ?? []) fn();
    },
    simulateListenPayload(data: unknown) {
      for (const fn of listeners[listenEvent] ?? []) fn(data);
    },
  };
  ioMock.mockReturnValue(socket);
  return { socket, listeners };
}

describe("useSocketIoConsole", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("connects via io(url+namespace), logs lifecycle and listen payloads, emit forwards parsed JSON", () => {
    const { socket } = createListenersSocket("tick");
    const { result } = renderHook(() =>
      useSocketIoConsole({ url: "http://localhost:4001", namespace: "/ticker", listenEvent: "tick" }),
    );

    act(() => {
      result.current.connect();
    });

    expect(ioMock).toHaveBeenCalledWith(
      "http://localhost:4001/ticker",
      expect.objectContaining({ reconnection: false, path: "/socket.io" }),
    );

    act(() => {
      socket.simulateConnect();
    });

    expect(result.current.status).toBe("connected");
    expect(result.current.events.some((e) => e.message === "[connected]")).toBe(true);

    act(() => {
      socket.simulateListenPayload({ price: 12 });
    });

    expect(
      result.current.events.some((e) => e.direction === "in" && e.message.includes("tick")),
    ).toBe(true);

    act(() => {
      expect(result.current.emit("ping", '{"a":1}')).toBe(true);
    });

    expect(socket.emit).toHaveBeenCalledWith("ping", { a: 1 });
    expect(
      result.current.events.some((e) => e.direction === "out" && e.message.includes("ping")),
    ).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(socket.disconnect).toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("emit with empty payload calls emit(name) only", () => {
    const { socket } = createListenersSocket("tick");
    const { result } = renderHook(() =>
      useSocketIoConsole({ url: "http://localhost:4001", namespace: "/ticker", listenEvent: "tick" }),
    );

    act(() => {
      result.current.connect();
    });
    act(() => {
      socket.simulateConnect();
    });

    act(() => {
      expect(result.current.emit("sub", "  ")).toBe(true);
    });

    expect(socket.emit).toHaveBeenCalledWith("sub");
  });

  it("emit returns false for invalid JSON and does not call socket.emit", () => {
    const { socket } = createListenersSocket("tick");
    const { result } = renderHook(() =>
      useSocketIoConsole({ url: "http://localhost:4001", namespace: "/ticker", listenEvent: "tick" }),
    );

    act(() => {
      result.current.connect();
    });
    act(() => {
      socket.simulateConnect();
    });

    act(() => {
      expect(result.current.emit("x", "not-json")).toBe(false);
    });

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("does not call io when base URL is missing", () => {
    const { result } = renderHook(() =>
      useSocketIoConsole({ url: "   ", namespace: "/ticker", listenEvent: "tick" }),
    );

    act(() => {
      result.current.connect();
    });

    expect(ioMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
  });

  it("disconnects the socket on unmount", () => {
    const { socket } = createListenersSocket("tick");
    const { result, unmount } = renderHook(() =>
      useSocketIoConsole({ url: "http://localhost:4001", namespace: "/ticker", listenEvent: "tick" }),
    );

    act(() => {
      result.current.connect();
    });
    act(() => {
      socket.simulateConnect();
    });

    unmount();

    expect(socket.disconnect).toHaveBeenCalled();
  });
});
