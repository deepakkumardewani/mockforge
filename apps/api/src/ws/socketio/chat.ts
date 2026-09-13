import type { Namespace } from "socket.io";
import { generateMessages } from "../../data/generators/messages";
import { DEFAULT_WS_PARAMS } from "../types";

const ROOM_EMIT_INTERVAL_MS = 3000;
const REPLY_DELAY_MS = 1000;

export function registerChatNamespace(ns: Namespace): void {
  setInterval(() => {
    if (ns.sockets.size === 0) return;
    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      ns.emit("message", { ...msg, roomId: "default" });
    } catch (error) {
      console.error("[sio/chat] scheduled emit failed", error);
    }
  }, ROOM_EMIT_INTERVAL_MS);

  ns.on("connection", (socket) => {
    const roomId: string = (socket.handshake.query.roomId as string) ?? "default";
    void socket.join(roomId);
    console.log(`[sio/chat] connected ${socket.id} → room "${roomId}"`);

    try {
      const [msg] = generateMessages(DEFAULT_WS_PARAMS);
      socket.emit("message", { ...msg, roomId });
    } catch (error) {
      console.error("[sio/chat] welcome emit failed", error);
    }

    socket.on("message", (data: unknown) => {
      console.log(`[sio/chat] message from ${socket.id} in room "${roomId}"`);
      ns.to(roomId).emit("message", data);

      setTimeout(() => {
        const [reply] = generateMessages(DEFAULT_WS_PARAMS);
        ns.to(roomId).emit("message", {
          ...reply,
          roomId,
          replyTo: (data as Record<string, unknown>)?.id ?? null,
        });
      }, REPLY_DELAY_MS);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[sio/chat] disconnected ${socket.id} (${reason})`);
    });
  });
}
