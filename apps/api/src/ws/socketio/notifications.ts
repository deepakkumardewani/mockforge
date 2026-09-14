import type { Namespace } from "socket.io";
import { generateNotifications } from "../../data/generators/notifications";
import { DEFAULT_WS_PARAMS } from "../types";
import { admitRealtimeSocket } from "./admit";

const EMIT_INTERVAL_MS = 2000;

const emitIntervals: ReturnType<typeof setInterval>[] = [];

export function stopNotificationsNamespace(): void {
  for (const interval of emitIntervals) clearInterval(interval);
  emitIntervals.length = 0;
}

export function registerNotificationsNamespace(ns: Namespace): void {
  function emitNotification(): void {
    const [notification] = generateNotifications(DEFAULT_WS_PARAMS);
    ns.emit("notification", notification);
  }

  const interval = setInterval(() => {
    if (ns.sockets.size === 0) return;
    try {
      emitNotification();
    } catch (error) {
      console.error("[sio/notifications] emit failed", error);
    }
  }, EMIT_INTERVAL_MS);
  emitIntervals.push(interval);

  ns.on("connection", (socket) => {
    if (!admitRealtimeSocket(socket)) return;
    console.log(`[sio/notifications] connected ${socket.id}`);
    try {
      const [notification] = generateNotifications(DEFAULT_WS_PARAMS);
      socket.emit("notification", notification);
    } catch (error) {
      console.error("[sio/notifications] first emit failed", error);
    }

    socket.on("disconnect", (reason) => {
      console.log(`[sio/notifications] disconnected ${socket.id} (${reason})`);
    });
  });
}
