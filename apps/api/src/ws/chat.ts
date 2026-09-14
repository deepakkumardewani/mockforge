import { generateMessages } from "../data/generators/messages";
import type { BunWs } from "./types";
import { DEFAULT_WS_PARAMS } from "./types";
import { sendToClients } from "./client-set";

const ROOM_EMIT_INTERVAL_MS = 3000;
const REPLY_DELAY_MS = 1000;

const clients = new Set<BunWs>();
let roomInterval: ReturnType<typeof setInterval> | null = null;

function roomTopic(roomId: string): string {
  return `chat:${roomId}`;
}

function clientsInRoom(roomId: string): Set<BunWs> {
  const room = new Set<BunWs>();
  for (const ws of clients) {
    if ((ws.data.roomId ?? "default") === roomId) room.add(ws);
  }
  return room;
}

function publishToRoom(ws: BunWs, payload: string): void {
  const roomId = ws.data.roomId ?? "default";
  sendToClients(clientsInRoom(roomId), payload);
}

function broadcastRoomNoise(): void {
  if (clients.size === 0) return;
  const rooms = new Set<string>();
  for (const ws of clients) rooms.add(ws.data.roomId ?? "default");
  for (const roomId of rooms) {
    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      sendToClients(clientsInRoom(roomId), JSON.stringify({ ...msg, roomId }));
    } catch (err) {
      console.error("[ws/chat] scheduled emit failed", err);
    }
  }
}

function startRoomPump(): void {
  if (roomInterval) return;
  roomInterval = setInterval(broadcastRoomNoise, ROOM_EMIT_INTERVAL_MS);
}

startRoomPump();

export function stopChat(): void {
  if (roomInterval) {
    clearInterval(roomInterval);
    roomInterval = null;
  }
}

export const chatWsHandler = {
  open(ws: BunWs, roomId: string): void {
    ws.data.roomId = roomId;
    ws.subscribe(roomTopic(roomId));
    clients.add(ws);
    startRoomPump();
    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      ws.send(JSON.stringify({ ...msg, roomId }));
    } catch (err) {
      console.error("[ws/chat] welcome send failed", err);
    }
  },

  close(ws: BunWs): void {
    clients.delete(ws);
    if (ws.data?.emitTimer) clearTimeout(ws.data.emitTimer);
    if (ws.data?.pingTimeout) clearTimeout(ws.data.pingTimeout);
    ws.unsubscribe(`chat:${ws.data.roomId}`);
  },

  message(ws: BunWs, msg: string | Buffer): void {
    try {
      const parsed = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString());
      publishToRoom(ws, JSON.stringify(parsed));

      if (ws.data.emitTimer) clearTimeout(ws.data.emitTimer);
      ws.data.emitTimer = setTimeout(() => {
        ws.data.emitTimer = undefined;
        try {
          const [reply] = generateMessages(DEFAULT_WS_PARAMS);
          const replyPayload = { ...reply, roomId: ws.data.roomId, replyTo: parsed.id ?? null };
          publishToRoom(ws, JSON.stringify(replyPayload));
        } catch (err) {
          console.error("[ws/chat] reply publish failed", err);
        }
      }, REPLY_DELAY_MS);
    } catch {
      // ignore malformed messages
    }
  },
};
