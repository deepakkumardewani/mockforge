import { API_BASE } from "@/lib/api-client";

/** Map the configured HTTP API origin to a playground WebSocket URL for any path. */
export function playgroundWsUrl(path: string): string {
  const origin = API_BASE.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  if (origin.startsWith("https://")) {
    return `wss://${origin.slice("https://".length)}${suffix}`;
  }
  if (origin.startsWith("http://")) {
    return `ws://${origin.slice("http://".length)}${suffix}`;
  }
  return `${origin}${suffix}`;
}

/** Playground ticker stream; origin follows the configured MockForge API (not configurable in UI). */
export const PLAYGROUND_WS_URL = playgroundWsUrl("/ws/ticker");
