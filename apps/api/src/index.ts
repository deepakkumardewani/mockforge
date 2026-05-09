import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { initializeRedis, pingRedis } from "./db/redis";
import { mfIdMiddleware } from "./middleware/mf-id";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { requestCounterMiddleware } from "./middleware/request-counter";
import { errorHandler, createErrorResponse } from "./middleware/error-handler";
import statsRoutes from "./routes/stats";
import restRouter from "./routes/rest";
import graphqlRouter from "./routes/graphql";

// Initialize Redis on startup (hot-reload trigger)
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
app.route("/graphql", graphqlRouter);

// 404 handler
app.notFound((c) => {
  const response = createErrorResponse(
    "NOT_FOUND",
    `Route ${c.req.method} ${c.req.path} not found`
  );
  return c.json(response, 404);
});

// Error handler
app.onError((err, c) => {
  return errorHandler(err, c);
});

const port = Number(process.env.PORT ?? 4000);

export default {
  port,
  fetch: app.fetch,
};
