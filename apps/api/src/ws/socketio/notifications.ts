import type { Namespace } from "socket.io";
import { generateNotifications } from "../../data/generators/notifications";
import { DEFAULT_WS_PARAMS } from "../types";

const EMIT_MIN_MS = 3000;
const EMIT_MAX_MS = 7000;

export function registerNotificationsNamespace(ns: Namespace): void {
  ns.on("connection", (socket) => {
    console.log(`[sio/notifications] connected ${socket.id}`);
    let timer: ReturnType<typeof setTimeout> | null = null;

    function scheduleNext(): void {
      const delay = EMIT_MIN_MS + Math.random() * (EMIT_MAX_MS - EMIT_MIN_MS);
      timer = setTimeout(() => {
        const [notification] = generateNotifications(DEFAULT_WS_PARAMS);
        socket.emit("notification", notification);
        scheduleNext();
      }, delay);
    }

    scheduleNext();

    socket.on("disconnect", (reason) => {
      if (timer) clearTimeout(timer);
      console.log(`[sio/notifications] disconnected ${socket.id} (${reason})`);
    });
  });
}
