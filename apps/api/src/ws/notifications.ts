import { generateNotifications } from "../data/generators/notifications";
import type { BunWs } from "./types";
import { DEFAULT_WS_PARAMS } from "./types";

const EMIT_MIN_MS = 3000;
const EMIT_MAX_MS = 7000;

function scheduleNext(ws: BunWs): void {
  const delay = EMIT_MIN_MS + Math.random() * (EMIT_MAX_MS - EMIT_MIN_MS);
  ws.data.emitTimer = setTimeout(() => {
    try {
      const [notification] = generateNotifications(DEFAULT_WS_PARAMS);
      ws.send(JSON.stringify(notification));
      scheduleNext(ws);
    } catch {
      // client disconnected
    }
  }, delay);
}

export const notificationsWsHandler = {
  open(ws: BunWs): void {
    scheduleNext(ws);
    console.log(`[ws/notifications] client connected`);
  },

  close(ws: BunWs): void {
    if (ws.data?.emitTimer) clearTimeout(ws.data.emitTimer);
    if (ws.data?.pingTimeout) clearTimeout(ws.data.pingTimeout);
  },

  message(_ws: BunWs, _msg: string | Buffer): void {
    // notifications stream is server-push only
  },
};
