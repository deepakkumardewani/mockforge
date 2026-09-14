import type { WebSocketHandler } from "bun";
import { incrementRequestCounter } from "../stats/increment-counter";
import { statsWsHandler, stopBroadcast } from "./stats";
import { notificationsWsHandler, stopNotifications } from "./notifications";
import { chatWsHandler, stopChat } from "./chat";
import { tickerWsHandler, stopTicker } from "./ticker";
import { WS_MAX_PAYLOAD_BYTES } from "./limits";
import { decodePathRoomId, DEFAULT_CHAT_ROOM_ID } from "./room";
import {
  admitConnection,
  admitMessage,
  consumePendingOpen,
  nativeClientKey,
  notePendingOpen,
  releaseConnection,
} from "./throttle";
import type { WsData, BunServer, BunWs } from "./types";

function failedUpgrade(): Response {
  return new Response("WebSocket upgrade failed", { status: 500 });
}

function tooManyConnections(): Response {
  return new Response("Too many websocket connections", { status: 429 });
}

function invalidRoom(): Response {
  return new Response("Invalid chat room id", { status: 400 });
}

function peerAddress(server: BunServer, req: Request): string | undefined {
  if (typeof server.requestIP !== "function") return undefined;
  return server.requestIP(req)?.address;
}

/** Keep clientKey off enumerable shape so upgrade tests can still match { route, roomId }. */
function attachClientKey(data: WsData, clientKey: string): WsData {
  Object.defineProperty(data, "clientKey", {
    value: clientKey,
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return data;
}

function upgradeWithData(req: Request, server: BunServer, data: WsData): Response | undefined {
  const clientKey = nativeClientKey(peerAddress(server, req));
  if (!admitConnection(clientKey)) return tooManyConnections();
  const payload = attachClientKey({ ...data }, clientKey);
  const ok = server.upgrade(req, { data: payload });
  if (!ok) {
    releaseConnection(clientKey);
    return failedUpgrade();
  }
  notePendingOpen(clientKey);
  return undefined;
}

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
    return upgradeWithData(req, server, { route: "stats" });
  }

  if (path === "/ws/notifications") {
    return upgradeWithData(req, server, { route: "notifications" });
  }

  if (path === "/ws/ticker") {
    return upgradeWithData(req, server, { route: "ticker" });
  }

  if (path === "/ws/chat" || path === "/ws/chat/") {
    return upgradeWithData(req, server, { route: "chat", roomId: DEFAULT_CHAT_ROOM_ID });
  }

  const chatMatch = path.match(/^\/ws\/chat\/(.+)$/);
  if (chatMatch?.[1] !== undefined) {
    const roomId = decodePathRoomId(chatMatch[1]);
    if (!roomId) return invalidRoom();
    return upgradeWithData(req, server, { route: "chat", roomId });
  }

  return null;
}

function socketPeerKey(ws: BunWs): string {
  const remote = "remoteAddress" in ws ? String(ws.remoteAddress ?? "") : "";
  return nativeClientKey(remote || undefined);
}

export function stopWsIntervals(): void {
  stopBroadcast();
  stopNotifications();
  stopTicker();
  stopChat();
}

export const websocketHandlers: WebSocketHandler<WsData> = {
  maxPayloadLength: WS_MAX_PAYLOAD_BYTES,

  open(ws) {
    const clientKey = ws.data.clientKey ?? socketPeerKey(ws);
    if (consumePendingOpen(clientKey)) {
      ws.data.clientKey = clientKey;
    } else if (!ws.data.clientKey) {
      if (!admitConnection(clientKey)) {
        ws.close(1008, "rate limit");
        return;
      }
      ws.data.clientKey = clientKey;
    }

    switch (ws.data.route) {
      case "stats":
        statsWsHandler.open(ws);
        break;
      case "notifications":
        incrementRequestCounter();
        notificationsWsHandler.open(ws);
        break;
      case "chat":
        incrementRequestCounter();
        chatWsHandler.open(ws, ws.data.roomId ?? DEFAULT_CHAT_ROOM_ID);
        break;
      case "ticker":
        incrementRequestCounter();
        tickerWsHandler.open(ws);
        break;
    }
  },

  close(ws) {
    if (ws.data.clientKey) releaseConnection(ws.data.clientKey);
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
    const key = ws.data.clientKey ?? socketPeerKey(ws);
    if (!admitMessage(key)) {
      ws.close(1008, "rate limit");
      return;
    }
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
