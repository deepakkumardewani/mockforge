import { Context, Next } from "hono";
import { incrementRequestCounter, isCountableHttpPath } from "../stats/increment-counter";

export async function requestCounterMiddleware(c: Context, next: Next) {
  await next();

  const status = c.res.status;
  if (status < 200 || status >= 300) return;
  if (!isCountableHttpPath(c.req.path)) return;

  incrementRequestCounter();
}
