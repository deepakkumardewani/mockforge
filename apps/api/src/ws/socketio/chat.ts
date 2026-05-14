import type { Namespace } from "socket.io";
import { generateMessages } from "../../data/generators/messages";
import { DEFAULT_WS_PARAMS } from "../types";

const EMIT_MIN_MS = 2000;
const EMIT_MAX_MS = 5000;
const REPLY_DELAY_MS = 1000;

export function registerChatNamespace(ns: Namespace): void {
  ns.on("connection", (socket) => {
    const roomId: string = (socket.handshake.query.roomId as string) ?? "default";
    socket.join(roomId);
    console.log(`[sio/chat] connected ${socket.id} → room "${roomId}"`);

    let timer: ReturnType<typeof setTimeout> | null = null;

    function scheduleNext(): void {
      const delay = EMIT_MIN_MS + Math.random() * (EMIT_MAX_MS - EMIT_MIN_MS);
      timer = setTimeout(() => {
        const [msg] = generateMessages(DEFAULT_WS_PARAMS);
        ns.to(roomId).emit("message", { ...msg, roomId });
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    socket.on("message", (data: unknown) => {
      console.log(`[sio/chat] message from ${socket.id} in room "${roomId}"`);
      // Echo to entire room (including sender)
      ns.to(roomId).emit("message", data);

      // Fake auto-reply after 1s
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
      if (timer) clearTimeout(timer);
      console.log(`[sio/chat] disconnected ${socket.id} (${reason})`);
    });
  });
}
