import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

const port = Number(process.env.PORT ?? 4000);

export default {
  port,
  fetch: app.fetch,
};
