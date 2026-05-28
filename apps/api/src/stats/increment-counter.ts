import { getRedis } from "../db/redis";

export const STATS_KEY = "stats:total_requests";

const EXCLUDED_HTTP_PATHS = new Set(["/health", "/api/stats"]);

export function isCountableHttpPath(pathname: string): boolean {
  if (EXCLUDED_HTTP_PATHS.has(pathname)) return false;
  if (pathname === "/graphql") return true;
  if (pathname.startsWith("/api/")) return true;
  return false;
}

export function isCountableWsPath(pathname: string): boolean {
  if (pathname === "/ws/stats") return false;
  return pathname.startsWith("/ws/");
}

export function incrementRequestCounter(): void {
  void (async () => {
    try {
      await getRedis().incr(STATS_KEY);
    } catch (error) {
      console.error("[RequestCounter] Failed to increment counter:", error);
    }
  })();
}
