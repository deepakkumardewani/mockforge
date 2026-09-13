import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  initializeRedis,
  pingRedis,
  getRedis,
  handleWsUpgrade,
  websocketHandlers,
  createSocketIoServer,
  setServer,
  listen,
  createServer,
} = vi.hoisted(() => {
  const listen = vi.fn();
  return {
    initializeRedis: vi.fn(),
    pingRedis: vi.fn().mockResolvedValue(true),
    getRedis: vi.fn(() => ({
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      get: vi.fn().mockResolvedValue(null),
    })),
    handleWsUpgrade: vi.fn().mockReturnValue(null),
    websocketHandlers: { open: vi.fn(), close: vi.fn(), message: vi.fn() },
    createSocketIoServer: vi.fn(),
    setServer: vi.fn(),
    listen,
    createServer: vi.fn(() => ({ listen })),
  };
});

vi.mock("./db/redis", () => ({
  initializeRedis,
  pingRedis,
  getRedis,
}));

vi.mock("./ws", () => ({
  handleWsUpgrade,
  websocketHandlers,
}));

vi.mock("./ws/socketio", () => ({
  createSocketIoServer,
}));

vi.mock("./ws/server-ref", () => ({
  setServer,
}));

vi.mock("node:http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:http")>();
  return {
    ...actual,
    createServer,
  };
});

const MF_HEADERS = { "x-mf-id": "index-unit-test" };

function fakeBunServer() {
  return { upgrade: vi.fn() } as unknown as import("bun").Server<import("./ws/types").WsData>;
}

async function loadIndex() {
  return import("./index");
}

describe("index app wiring", () => {
  const prevPort = process.env.PORT;
  const prevSocketPort = process.env.SOCKET_IO_PORT;

  beforeEach(() => {
    vi.resetModules();
    delete process.env.PORT;
    delete process.env.SOCKET_IO_PORT;
    initializeRedis.mockClear();
    pingRedis.mockReset().mockResolvedValue(true);
    handleWsUpgrade.mockReset().mockReturnValue(null);
    createSocketIoServer.mockClear();
    setServer.mockClear();
    listen.mockClear();
    createServer.mockClear();
    getRedis.mockClear();
  });

  afterEach(() => {
    if (prevPort === undefined) delete process.env.PORT;
    else process.env.PORT = prevPort;
    if (prevSocketPort === undefined) delete process.env.SOCKET_IO_PORT;
    else process.env.SOCKET_IO_PORT = prevSocketPort;
  });

  it("initializes redis, attaches socket.io, and listens on default ports", async () => {
    const mod = await loadIndex();

    expect(initializeRedis).toHaveBeenCalledOnce();
    expect(createServer).toHaveBeenCalledOnce();
    expect(createSocketIoServer).toHaveBeenCalledWith({ listen });
    expect(listen).toHaveBeenCalledWith(4001);
    expect(mod.default.port).toBe(4000);
    expect(mod.default.websocket).toBe(websocketHandlers);
    expect(mod.app).toBeDefined();
  });

  it("uses PORT and SOCKET_IO_PORT from the environment", async () => {
    process.env.PORT = "4123";
    process.env.SOCKET_IO_PORT = "4124";

    const mod = await loadIndex();

    expect(listen).toHaveBeenCalledWith(4124);
    expect(mod.default.port).toBe(4123);
  });

  it("returns health with redis connected", async () => {
    pingRedis.mockResolvedValueOnce(true);
    const { app } = await loadIndex();

    const res = await app.request("/health", { headers: MF_HEADERS });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "ok", redis: "connected" });
  });

  it("returns health with redis disconnected", async () => {
    pingRedis.mockResolvedValueOnce(false);
    const { app } = await loadIndex();

    const res = await app.request("/health", { headers: MF_HEADERS });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "ok", redis: "disconnected" });
  });

  it("returns a structured 404 for unknown routes", async () => {
    const { app } = await loadIndex();

    const res = await app.request("/definitely-missing", { headers: MF_HEADERS });
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route GET /definitely-missing not found",
      },
    });
  });

  it("runs the middleware stack (mf-id, rate-limit, cors)", async () => {
    const { app } = await loadIndex();

    const res = await app.request("/health", {
      headers: {
        ...MF_HEADERS,
        Origin: "http://localhost:3000",
      },
    });

    expect(res.status).toBe(200);
    expect(getRedis).toHaveBeenCalled();
    expect(res.headers.get("x-ratelimit-limit")).toBe("300");
    expect(res.headers.get("access-control-allow-origin")).toBeTruthy();
  });

  it("mounts graphql so the route is not a 404", async () => {
    const { app } = await loadIndex();

    const res = await app.request("/graphql", {
      method: "POST",
      headers: {
        ...MF_HEADERS,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: "{ __typename }" }),
    });

    expect(res.status).not.toBe(404);
    const body = (await res.json()) as { data?: { __typename?: string } };
    expect(body.data?.__typename).toBe("Query");
  });

  it("delegates onError when a route throws", async () => {
    pingRedis.mockRejectedValueOnce(new Error("redis ping failed"));
    const { app } = await loadIndex();

    const res = await app.request("/health", { headers: MF_HEADERS });
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "redis ping failed",
      },
    });
  });

  it("delegates websocket upgrades and stores the server ref", async () => {
    const { default: bunApp } = await loadIndex();
    const server = fakeBunServer();
    const upgradeResponse = new Response("upgrade-failed", { status: 500 });
    handleWsUpgrade.mockReturnValueOnce(upgradeResponse);

    const req = new Request("http://localhost/ws/stats");
    const result = bunApp.fetch(req, server);

    expect(setServer).toHaveBeenCalledWith(server);
    expect(handleWsUpgrade).toHaveBeenCalledWith(req, server);
    expect(result).toBe(upgradeResponse);
  });

  it("returns undefined when websocket upgrade succeeds", async () => {
    const { default: bunApp } = await loadIndex();
    handleWsUpgrade.mockReturnValueOnce(undefined);

    const result = bunApp.fetch(new Request("http://localhost/ws/chat"), fakeBunServer());
    expect(result).toBeUndefined();
  });

  it("falls through to Hono when upgrade is not a websocket path", async () => {
    pingRedis.mockResolvedValueOnce(true);
    handleWsUpgrade.mockReturnValueOnce(null);
    const { default: bunApp } = await loadIndex();

    const req = new Request("http://localhost/health", { headers: MF_HEADERS });
    const result = bunApp.fetch(req, fakeBunServer());
    expect(result).toBeInstanceOf(Promise);

    const res = await result;
    expect(res).toBeInstanceOf(Response);
    expect(res?.status).toBe(200);
    await expect(res!.json()).resolves.toEqual({ status: "ok", redis: "connected" });
  });
});
