import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createServer } from "node:http";

import { initializeRedis, pingRedis } from "./db/redis";
import { mfIdMiddleware } from "./middleware/mf-id";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { requestCounterMiddleware } from "./middleware/request-counter";
import { errorHandler, createErrorResponse } from "./middleware/error-handler";
import statsRoutes from "./routes/stats";
import restRouter from "./routes/rest";
import graphqlRouter from "./routes/graphql";
import schemasRouter from "./routes/schemas";
import { handleWsUpgrade, websocketHandlers } from "./ws";
import { createSocketIoServer } from "./ws/socketio";
import { setServer } from "./ws/server-ref";
import type { WsData } from "./ws/types";

// Initialize Redis on startup
initializeRedis();

const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("*", logger());

// Custom middleware
app.use("*", mfIdMiddleware);
app.use("*", rateLimitMiddleware);
app.use("*", requestCounterMiddleware);

// Routes
app.get("/health", async (c) => {
  const redisConnected = await pingRedis();
  return c.json({
    status: "ok",
    redis: redisConnected ? "connected" : "disconnected",
  });
});

app.route("/", statsRoutes);
app.route("/api", restRouter);
app.route("/api/schemas", schemasRouter);
app.route("/graphql", graphqlRouter);

// 404 handler
app.notFound((c) => {
  const response = createErrorResponse(
    "NOT_FOUND",
    `Route ${c.req.method} ${c.req.path} not found`,
  );
  return c.json(response, 404);
});

// Error handler
app.onError((err, c) => {
  return errorHandler(err, c);
});

// Socket.io runs on a separate port — Bun.serve owns 4000 and can't share with Node http.Server
const socketIoPort = Number(process.env.SOCKET_IO_PORT ?? 4001);
const httpServer = createServer();
createSocketIoServer(httpServer);
httpServer.listen(socketIoPort);

const port = Number(process.env.PORT ?? 4000);

// Bun's export-default pattern: hot-reload and Bun.serve both honour { port, fetch, websocket }
export default {
  port,
  websocket: websocketHandlers as import("bun").WebSocketHandler<WsData>,
  fetch(req: Request, server: import("bun").Server<WsData>) {
    // Store server ref on first request so WS broadcast handlers can use server.publish()
    setServer(server);
    const wsResult = handleWsUpgrade(req, server);
    // null      → not a WS path, let Hono handle
    // undefined → upgrade succeeded, Bun owns the connection
    // Response  → upgrade failed
    if (wsResult !== null) return wsResult;
    return app.fetch(req);
  },
};
