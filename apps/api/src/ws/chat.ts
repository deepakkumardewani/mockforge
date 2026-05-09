import { generateMessages } from "../data/generators/messages";
import type { BunWs } from "./types";
import { DEFAULT_WS_PARAMS } from "./types";

const EMIT_MIN_MS = 2000;
const EMIT_MAX_MS = 5000;
const REPLY_DELAY_MS = 1000;

function scheduleNext(ws: BunWs): void {
  const delay = EMIT_MIN_MS + Math.random() * (EMIT_MAX_MS - EMIT_MIN_MS);
  ws.data.emitTimer = setTimeout(() => {
    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      const payload = { ...msg, roomId: ws.data.roomId };
      // ws.publish broadcasts to all subscribers of the chat room topic
      ws.publish(`chat:${ws.data.roomId}`, JSON.stringify(payload));
      scheduleNext(ws);
    } catch {
      // client disconnected
    }
  }, delay);
}

export const chatWsHandler = {
  open(ws: BunWs, roomId: string): void {
    ws.data.roomId = roomId;
    ws.subscribe(`chat:${roomId}`);
    scheduleNext(ws);
  },

  close(ws: BunWs): void {
    if (ws.data?.emitTimer) clearTimeout(ws.data.emitTimer);
    if (ws.data?.pingTimeout) clearTimeout(ws.data.pingTimeout);
    ws.unsubscribe(`chat:${ws.data.roomId}`);
  },

  message(ws: BunWs, msg: string | Buffer): void {
    try {
      const parsed = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString());
      ws.publish(`chat:${ws.data.roomId}`, JSON.stringify(parsed));

      setTimeout(() => {
        try {
          const [reply] = generateMessages(DEFAULT_WS_PARAMS);
          const replyPayload = { ...reply, roomId: ws.data.roomId, replyTo: parsed.id ?? null };
          ws.publish(`chat:${ws.data.roomId}`, JSON.stringify(replyPayload));
        } catch {
          // ignore
        }
      }, REPLY_DELAY_MS);
    } catch {
      // ignore malformed messages
    }
  },
};
