import type { WebSocketHandler } from "bun";
import { statsWsHandler } from "./stats";
import { notificationsWsHandler } from "./notifications";
import { chatWsHandler } from "./chat";
import { tickerWsHandler } from "./ticker";
import type { WsData, BunServer } from "./types";

/**
 * Returns:
 *  - `null`      → not a WS path; let Hono handle it
 *  - `undefined` → upgrade succeeded; Bun owns the connection
 *  - `Response`  → upgrade failed; return error to client
 */
export function handleWsUpgrade(req: Request, server: BunServer): Response | null | undefined {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/ws/stats") {
    return server.upgrade(req, { data: { route: "stats" } })
      ? undefined
      : new Response("WebSocket upgrade failed", { status: 500 });
  }

  if (path === "/ws/notifications") {
    return server.upgrade(req, { data: { route: "notifications" } })
      ? undefined
      : new Response("WebSocket upgrade failed", { status: 500 });
  }

  if (path === "/ws/ticker") {
    return server.upgrade(req, { data: { route: "ticker" } })
      ? undefined
      : new Response("WebSocket upgrade failed", { status: 500 });
  }

  const chatMatch = path.match(/^\/ws\/chat\/(.+)$/);
  if (chatMatch) {
    const roomId = chatMatch[1];
    return server.upgrade(req, { data: { route: "chat", roomId } })
      ? undefined
      : new Response("WebSocket upgrade failed", { status: 500 });
  }

  return null; // not a WS path
}

export const websocketHandlers: WebSocketHandler<WsData> = {
  open(ws) {
    switch (ws.data.route) {
      case "stats":
        statsWsHandler.open(ws);
        break;
      case "notifications":
        notificationsWsHandler.open(ws);
        break;
      case "chat":
        chatWsHandler.open(ws, ws.data.roomId ?? "default");
        break;
      case "ticker":
        tickerWsHandler.open(ws);
        break;
    }
  },

  close(ws) {
    switch (ws.data.route) {
      case "stats":
        statsWsHandler.close(ws);
        break;
      case "notifications":
        notificationsWsHandler.close(ws);
        break;
      case "chat":
        chatWsHandler.close(ws);
        break;
      case "ticker":
        tickerWsHandler.close(ws);
        break;
    }
  },

  message(ws, msg) {
    switch (ws.data.route) {
      case "stats":
        statsWsHandler.message(ws, msg);
        break;
      case "notifications":
        notificationsWsHandler.message(ws, msg);
        break;
      case "chat":
        chatWsHandler.message(ws, msg);
        break;
      case "ticker":
        tickerWsHandler.message(ws, msg);
        break;
    }
  },
};
