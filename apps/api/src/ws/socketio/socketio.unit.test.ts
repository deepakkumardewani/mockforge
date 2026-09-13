import { EventEmitter } from "node:events";
import type { Server as HttpServer } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { TICKER_EVENT } from "../ticker-book";

const incrementRequestCounter = vi.fn();

class FakeNamespace extends EventEmitter {
  sockets = new Map<string, unknown>();
  clientEmit = vi.fn();
  roomEmit = vi.fn();
  to = vi.fn(() => ({ emit: this.roomEmit }));

  emit(event: string | symbol, ...args: unknown[]): boolean {
    if (event === "connection") {
      return super.emit(event, ...args);
    }
    this.clientEmit(event, ...args);
    return true;
  }
}

const namespaces = new Map<string, FakeNamespace>();

function getNamespace(name: string): FakeNamespace {
  const existing = namespaces.get(name);
  if (existing) return existing;
  const created = new FakeNamespace();
  namespaces.set(name, created);
  return created;
}

const Server = vi.fn(function MockServer(_httpServer: unknown, _opts: unknown) {
  return {
    of: vi.fn((name: string) => getNamespace(name)),
  };
});

vi.mock("socket.io", () => ({
  Server,
}));

vi.mock("../../stats/increment-counter", () => ({
  incrementRequestCounter,
}));

function makeSocket(query: Record<string, string> = {}) {
  const handlers = new Map<string, Array<(...args: unknown[]) => void>>();

  return {
    id: "sock-1",
    handshake: { query },
    join: vi.fn().mockResolvedValue(undefined),
    emit: vi.fn(),
    on: vi.fn((event: string, fn: (...args: unknown[]) => void) => {
      const list = handlers.get(event) ?? [];
      list.push(fn);
      handlers.set(event, list);
    }),
    trigger(event: string, ...args: unknown[]) {
      for (const fn of handlers.get(event) ?? []) {
        fn(...args);
      }
    },
  };
}

describe("createSocketIoServer", () => {
  let createSocketIoServer: typeof import("./index").createSocketIoServer;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ createSocketIoServer } = await import("./index"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    namespaces.clear();
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("constructs a Socket.IO server with the /socket.io path and does not listen", () => {
    const httpServer = {} as HttpServer;

    const io = createSocketIoServer(httpServer);

    expect(Server).toHaveBeenCalledWith(
      httpServer,
      expect.objectContaining({
        path: "/socket.io",
        cors: expect.objectContaining({ methods: ["GET", "POST"] }),
      }),
    );
    expect(io.of).toHaveBeenCalledWith("/notifications");
    expect(io.of).toHaveBeenCalledWith("/chat");
    expect(io.of).toHaveBeenCalledWith("/ticker");
  });

  it("increments the request counter on namespace connection", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/ticker");
    const socket = makeSocket();

    ns.emit("connection", socket);

    expect(incrementRequestCounter).toHaveBeenCalledTimes(1);
  });

  it("restricts CORS origin to WEB_ORIGIN in production", async () => {
    vi.resetModules();
    process.env.NODE_ENV = "production";
    process.env.WEB_ORIGIN = "https://app.example.com";
    Server.mockClear();
    namespaces.clear();
    const { createSocketIoServer: createProd } = await import("./index");

    createProd({} as HttpServer);

    expect(Server).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        cors: expect.objectContaining({
          origin: ["https://app.example.com"],
        }),
      }),
    );
  });
});

describe("registerTickerNamespace", () => {
  let createSocketIoServer: typeof import("./index").createSocketIoServer;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ createSocketIoServer } = await import("./index"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    namespaces.clear();
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("emits an immediate tick to the connecting socket", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/ticker");
    const socket = makeSocket();

    ns.emit("connection", socket);

    expect(socket.emit).toHaveBeenCalledWith(
      TICKER_EVENT,
      expect.objectContaining({
        symbol: expect.any(String),
        price: expect.any(Number),
      }),
    );
  });

  it("does not broadcast ticks while the namespace has no sockets", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/ticker");

    vi.advanceTimersByTime(1000);

    expect(ns.clientEmit).not.toHaveBeenCalled();
  });

  it("broadcasts ticks on the interval once a socket is present", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/ticker");
    ns.sockets.set("sock-1", {});

    vi.advanceTimersByTime(1000);

    expect(ns.clientEmit).toHaveBeenCalledWith(
      TICKER_EVENT,
      expect.objectContaining({
        symbol: expect.any(String),
        price: expect.any(Number),
      }),
    );
  });

  it("swallows a failed immediate tick on connection", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/ticker");
    const socket = makeSocket();
    socket.emit.mockImplementation(() => {
      throw new Error("tick start failed");
    });

    expect(() => ns.emit("connection", socket)).not.toThrow();
    expect(error).toHaveBeenCalledWith("[sio/ticker] start failed", expect.any(Error));
    error.mockRestore();
  });

  it("swallows a failed interval tick when sockets are present", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/ticker");
    ns.sockets.set("sock-1", {});
    ns.clientEmit.mockImplementation(() => {
      throw new Error("tick emit failed");
    });

    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    expect(error).toHaveBeenCalledWith("[sio/ticker] emit failed", expect.any(Error));
    error.mockRestore();
  });
});

describe("registerNotificationsNamespace", () => {
  let createSocketIoServer: typeof import("./index").createSocketIoServer;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ createSocketIoServer } = await import("./index"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    namespaces.clear();
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("emits an immediate notification on connection", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/notifications");
    const socket = makeSocket();

    ns.emit("connection", socket);

    expect(socket.emit).toHaveBeenCalledWith("notification", expect.any(Object));
  });

  it("does not emit on the interval when no sockets are connected", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/notifications");

    vi.advanceTimersByTime(2000);

    expect(ns.clientEmit).not.toHaveBeenCalled();
  });

  it("emits a notification on the interval when sockets are present", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/notifications");
    ns.sockets.set("sock-1", {});

    vi.advanceTimersByTime(2000);

    expect(ns.clientEmit).toHaveBeenCalledWith("notification", expect.any(Object));
  });

  it("registers a disconnect listener without throwing", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/notifications");
    const socket = makeSocket();

    ns.emit("connection", socket);

    expect(() => socket.trigger("disconnect", "client namespace disconnect")).not.toThrow();
  });

  it("swallows a failed first notification emit", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/notifications");
    const socket = makeSocket();
    socket.emit.mockImplementation(() => {
      throw new Error("first notify failed");
    });

    expect(() => ns.emit("connection", socket)).not.toThrow();
    expect(error).toHaveBeenCalledWith("[sio/notifications] first emit failed", expect.any(Error));
    error.mockRestore();
  });

  it("swallows a failed interval notification emit", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/notifications");
    ns.sockets.set("sock-1", {});
    ns.clientEmit.mockImplementation(() => {
      throw new Error("notify emit failed");
    });

    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
    expect(error).toHaveBeenCalledWith("[sio/notifications] emit failed", expect.any(Error));
    error.mockRestore();
  });
});

describe("registerChatNamespace", () => {
  let createSocketIoServer: typeof import("./index").createSocketIoServer;

  beforeAll(async () => {
    vi.useFakeTimers();
    ({ createSocketIoServer } = await import("./index"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    namespaces.clear();
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("joins the queried room and emits a welcome message", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket({ roomId: "lobby" });

    ns.emit("connection", socket);

    expect(socket.join).toHaveBeenCalledWith("lobby");
    expect(socket.emit).toHaveBeenCalledWith(
      "message",
      expect.objectContaining({ roomId: "lobby" }),
    );
  });

  it("defaults to the default room when roomId is omitted", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket();

    ns.emit("connection", socket);

    expect(socket.join).toHaveBeenCalledWith("default");
    expect(socket.emit).toHaveBeenCalledWith(
      "message",
      expect.objectContaining({ roomId: "default" }),
    );
  });

  it("relays a chat message to the room and emits a delayed reply", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket({ roomId: "lobby" });
    ns.emit("connection", socket);
    ns.roomEmit.mockClear();

    socket.trigger("message", { id: "msg-1", text: "hello" });

    expect(ns.to).toHaveBeenCalledWith("lobby");
    expect(ns.roomEmit).toHaveBeenCalledWith("message", { id: "msg-1", text: "hello" });

    vi.advanceTimersByTime(1000);

    expect(ns.roomEmit).toHaveBeenCalledWith(
      "message",
      expect.objectContaining({ roomId: "lobby", replyTo: "msg-1" }),
    );
  });

  it("sets replyTo to null when the inbound payload has no id", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket({ roomId: "lobby" });
    ns.emit("connection", socket);
    ns.roomEmit.mockClear();

    socket.trigger("message", { text: "no-id" });
    vi.advanceTimersByTime(1000);

    expect(ns.roomEmit).toHaveBeenCalledWith("message", expect.objectContaining({ replyTo: null }));
  });

  it("does not treat an unknown inbound event as a chat message", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket({ roomId: "lobby" });
    ns.emit("connection", socket);
    ns.to.mockClear();
    ns.roomEmit.mockClear();

    socket.trigger("typing", { user: "alice" });

    expect(ns.to).not.toHaveBeenCalled();
    expect(ns.roomEmit).not.toHaveBeenCalled();
  });

  it("emits scheduled room noise only when sockets are connected", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");

    vi.advanceTimersByTime(3000);
    expect(ns.clientEmit).not.toHaveBeenCalled();

    ns.sockets.set("sock-1", {});
    vi.advanceTimersByTime(3000);

    expect(ns.clientEmit).toHaveBeenCalledWith(
      "message",
      expect.objectContaining({ roomId: "default" }),
    );
  });

  it("registers a disconnect listener without throwing", () => {
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket();

    ns.emit("connection", socket);

    expect(() => socket.trigger("disconnect", "transport close")).not.toThrow();
  });

  it("swallows a failed welcome emit", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    const socket = makeSocket();
    socket.emit.mockImplementation(() => {
      throw new Error("welcome failed");
    });

    expect(() => ns.emit("connection", socket)).not.toThrow();
    expect(error).toHaveBeenCalledWith("[sio/chat] welcome emit failed", expect.any(Error));
    error.mockRestore();
  });

  it("swallows a failed scheduled room emit", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createSocketIoServer({} as HttpServer);
    const ns = getNamespace("/chat");
    ns.sockets.set("sock-1", {});
    ns.clientEmit.mockImplementation(() => {
      throw new Error("scheduled failed");
    });

    expect(() => vi.advanceTimersByTime(3000)).not.toThrow();
    expect(error).toHaveBeenCalledWith("[sio/chat] scheduled emit failed", expect.any(Error));
    error.mockRestore();
  });
});
