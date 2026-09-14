import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createServer } from "node:http";

import { closeRedis, initializeRedis, pingRedis } from "./db/redis";
import { mfIdMiddleware } from "./middleware/mf-id";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { requestCounterMiddleware } from "./middleware/request-counter";
import { errorHandler, createErrorResponse } from "./middleware/error-handler";
import statsRoutes from "./routes/stats";
import restRouter from "./routes/rest";
import graphqlRouter from "./routes/graphql";
import schemasRouter from "./routes/schemas";
import { handleWsUpgrade, stopWsIntervals, websocketHandlers } from "./ws";
import { createSocketIoServer, stopSocketIoRuntime } from "./ws/socketio";
import { setServer } from "./ws/server-ref";
import type { WsData } from "./ws/types";

const MIN_LISTEN_PORT = 1;
const MAX_LISTEN_PORT = 65_535;
const DEFAULT_HTTP_PORT = 4000;
const DEFAULT_SOCKET_IO_PORT = 4001;
const SHUTDOWN_DRAIN_MS = 5_000;

function parseListenPort(raw: string | undefined, fallback: number, name: string): number {
  if (raw === undefined) return fallback;
  if (!/^\d+$/.test(raw)) {
    throw new Error(
      `Invalid ${name}=${JSON.stringify(raw)}: expected an integer between ${MIN_LISTEN_PORT} and ${MAX_LISTEN_PORT}`,
    );
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < MIN_LISTEN_PORT || value > MAX_LISTEN_PORT) {
    throw new Error(
      `Invalid ${name}=${JSON.stringify(raw)}: expected an integer between ${MIN_LISTEN_PORT} and ${MAX_LISTEN_PORT}`,
    );
  }
  return value;
}

function isVitest(): boolean {
  return Boolean(process.env.VITEST);
}

initializeRedis();

export const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.get("/health", async (c) => {
  const redisConnected = await pingRedis();
  return c.json({
    status: "ok",
    redis: redisConnected ? "connected" : "disconnected",
  });
});

app.use("*", mfIdMiddleware);
app.use("*", rateLimitMiddleware);
app.use("*", requestCounterMiddleware);

app.route("/", statsRoutes);
app.route("/api", restRouter);
app.route("/api/schemas", schemasRouter);
app.route("/graphql", graphqlRouter);

app.notFound((c) => {
  const response = createErrorResponse(
    "NOT_FOUND",
    `Route ${c.req.method} ${c.req.path} not found`,
  );
  return c.json(response, 404);
});

app.onError((err, c) => {
  return errorHandler(err, c);
});

const socketIoPort = parseListenPort(
  process.env.SOCKET_IO_PORT,
  DEFAULT_SOCKET_IO_PORT,
  "SOCKET_IO_PORT",
);
const port = parseListenPort(process.env.PORT, DEFAULT_HTTP_PORT, "PORT");

const httpServer = createServer();
const socketIo = createSocketIoServer(httpServer) as
  | { close?: (cb?: () => void) => void }
  | undefined;
httpServer.listen(socketIoPort);
if (isVitest() && typeof httpServer.unref === "function") {
  httpServer.unref();
}

let shuttingDown = false;

function runWithDrainTimeout(work: () => Promise<void>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    timer.unref?.();
    void work()
      .catch((err) => {
        console.error("[shutdown] drain failed", err);
      })
      .finally(() => {
        clearTimeout(timer);
        resolve();
      });
  });
}

async function stopStoredBunServer(): Promise<void> {
  if (isVitest()) return;
  try {
    const { peekServer } = await import("./ws/server-ref");
    const bunServer = peekServer();
    if (bunServer && typeof bunServer.stop === "function") {
      await bunServer.stop(true);
    }
  } catch {
    // Bun.serve from export default is not stored until the first fetch/upgrade.
  }
}

export async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  await runWithDrainTimeout(async () => {
    if (typeof stopWsIntervals === "function") stopWsIntervals();
    if (typeof stopSocketIoRuntime === "function") stopSocketIoRuntime();

    await new Promise<void>((resolve) => {
      if (socketIo && typeof socketIo.close === "function") {
        socketIo.close(() => resolve());
        return;
      }
      resolve();
    });

    await new Promise<void>((resolve) => {
      if (typeof httpServer.close === "function") {
        httpServer.close(() => resolve());
        return;
      }
      resolve();
    });

    if (typeof closeRedis === "function") await closeRedis();
    await stopStoredBunServer();
  }, SHUTDOWN_DRAIN_MS);
}

function exitAfterShutdown(code: number): void {
  if (isVitest()) return;
  process.exit(code);
}

function onProcessSignal(): void {
  if (shuttingDown) {
    exitAfterShutdown(1);
    return;
  }
  void shutdown().finally(() => {
    exitAfterShutdown(0);
  });
}

if (!isVitest()) {
  process.on("SIGTERM", onProcessSignal);
  process.on("SIGINT", onProcessSignal);
}

export default {
  port,
  websocket: websocketHandlers as import("bun").WebSocketHandler<WsData>,
  fetch(req: Request, server: import("bun").Server<WsData>) {
    setServer(server);
    const wsResult = handleWsUpgrade(req, server);
    if (wsResult !== null) return wsResult;
    return app.fetch(req);
  },
};
