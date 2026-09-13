import { generateNotifications } from "../data/generators/notifications";
import type { BunWs } from "./types";
import { DEFAULT_WS_PARAMS } from "./types";
import { sendToClients } from "./client-set";

const EMIT_INTERVAL_MS = 2000;

const clients = new Set<BunWs>();
let emitInterval: ReturnType<typeof setInterval> | null = null;

function buildNotificationPayload(): string {
  const [notification] = generateNotifications(DEFAULT_WS_PARAMS);
  if (!notification) {
    throw new Error("notifications generator returned no items");
  }
  return JSON.stringify(notification);
}

function broadcastNotification(): void {
  if (clients.size === 0) return;
  try {
    sendToClients(clients, buildNotificationPayload());
  } catch (error) {
    console.error("[ws/notifications] broadcast failed", error);
  }
}

function startNotifications(): void {
  if (emitInterval) return;
  emitInterval = setInterval(broadcastNotification, EMIT_INTERVAL_MS);
}

startNotifications();

export function stopNotifications(): void {
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }
  clients.clear();
}

export const notificationsWsHandler = {
  open(ws: BunWs): void {
    clients.add(ws);
    startNotifications();
    try {
      ws.send(buildNotificationPayload());
    } catch (error) {
      console.error("[ws/notifications] first send failed", error);
    }
    console.log(`[ws/notifications] client connected`);
  },

  close(ws: BunWs): void {
    clients.delete(ws);
    if (ws.data?.emitTimer) clearTimeout(ws.data.emitTimer);
    if (ws.data?.pingTimeout) clearTimeout(ws.data.pingTimeout);
  },

  message(_ws: BunWs, _msg: string | Buffer): void {
    // notifications stream is server-push only
  },
};
