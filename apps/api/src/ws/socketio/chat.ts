import type { Namespace, Socket } from "socket.io";
import { generateMessages } from "../../data/generators/messages";
import { DEFAULT_WS_PARAMS } from "../types";
import { DEFAULT_CHAT_ROOM_ID, roomIdFromQuery } from "../room";
import { admitMessage, clientKeyFromAddress } from "../throttle";
import { admitRealtimeSocket } from "./admit";

const ROOM_EMIT_INTERVAL_MS = 3000;
const REPLY_DELAY_MS = 1000;

const roomIntervals: ReturnType<typeof setInterval>[] = [];

export function stopChatNamespace(): void {
  for (const interval of roomIntervals) clearInterval(interval);
  roomIntervals.length = 0;
}

function defaultRoomOccupied(ns: Namespace): boolean {
  const occupants = ns.adapter?.rooms?.get(DEFAULT_CHAT_ROOM_ID);
  if (occupants) return occupants.size > 0;
  return ns.sockets.size > 0;
}

export function registerChatNamespace(ns: Namespace): void {
  const interval = setInterval(() => {
    if (!defaultRoomOccupied(ns)) return;
    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      ns.to(DEFAULT_CHAT_ROOM_ID).emit("message", { ...msg, roomId: DEFAULT_CHAT_ROOM_ID });
    } catch (error) {
      console.error("[sio/chat] scheduled emit failed", error);
    }
  }, ROOM_EMIT_INTERVAL_MS);
  roomIntervals.push(interval);

  ns.on("connection", (socket: Socket) => {
    if (!admitRealtimeSocket(socket)) return;

    const roomId = roomIdFromQuery(socket.handshake.query.roomId);
    if (!roomId) {
      if (typeof socket.disconnect === "function") socket.disconnect(true);
      return;
    }

    const pendingReplies = new Set<ReturnType<typeof setTimeout>>();
    const clientKey = clientKeyFromAddress(socket.handshake.address);

    void socket.join(roomId);
    console.log(`[sio/chat] connected ${socket.id} → room "${roomId}"`);

    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      socket.emit("message", { ...msg, roomId });
    } catch (error) {
      console.error("[sio/chat] welcome emit failed", error);
    }

    socket.on("message", (data: { id?: string }) => {
      if (!admitMessage(clientKey)) return;
      console.log(`[sio/chat] message from ${socket.id} in room "${roomId}"`);
      ns.to(roomId).emit("message", data);

      const timer = setTimeout(() => {
        pendingReplies.delete(timer);
        const [reply] = generateMessages(DEFAULT_WS_PARAMS);
        ns.to(roomId).emit("message", {
          ...reply,
          roomId,
          replyTo: data?.id ?? null,
        });
      }, REPLY_DELAY_MS);
      pendingReplies.add(timer);
    });

    socket.on("disconnect", (reason) => {
      for (const timer of pendingReplies) clearTimeout(timer);
      pendingReplies.clear();
      console.log(`[sio/chat] disconnected ${socket.id} (${reason})`);
    });
  });
}
