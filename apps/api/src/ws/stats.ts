import { getRedis } from "../db/redis";
import { getServer } from "./server-ref";
import type { BunWs } from "./types";

const BROADCAST_INTERVAL_MS = 2000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const PONG_TIMEOUT_MS = 10_000;
const STATS_TOPIC = "stats";

let broadcastInterval: ReturnType<typeof setInterval> | null = null;

function startBroadcast(): void {
  if (broadcastInterval) return;

  broadcastInterval = setInterval(async () => {
    try {
      const raw = await getRedis().get("stats:total_requests");
      const total = raw !== null ? Number(raw) : 0;
      // server.publish sends to ALL subscribers including the first subscriber
      getServer().publish(STATS_TOPIC, JSON.stringify({ total }));
    } catch {
      // fire-and-forget
    }
  }, BROADCAST_INTERVAL_MS);
}

export function stopBroadcast(): void {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
}

function scheduleHeartbeat(ws: BunWs): void {
  const pongTimeout = setTimeout(() => {
    ws.close(1001, "ping timeout");
  }, HEARTBEAT_INTERVAL_MS + PONG_TIMEOUT_MS);
  ws.data.pingTimeout = pongTimeout;

  setTimeout(() => {
    try {
      ws.send("ping");
    } catch {
      /* client gone */
    }
  }, HEARTBEAT_INTERVAL_MS);
}

function clearHeartbeat(ws: BunWs): void {
  if (ws.data?.pingTimeout) clearTimeout(ws.data.pingTimeout);
}

export const statsWsHandler = {
  open(ws: BunWs): void {
    ws.data.topic = STATS_TOPIC;
    ws.subscribe(STATS_TOPIC);
    startBroadcast();
    scheduleHeartbeat(ws);
    console.log(`[ws/stats] client connected`);
  },

  close(ws: BunWs): void {
    clearHeartbeat(ws);
    ws.unsubscribe(STATS_TOPIC);
    console.log(`[ws/stats] client disconnected`);
  },

  message(ws: BunWs, msg: string | Buffer): void {
    if (msg === "pong") {
      clearHeartbeat(ws);
      scheduleHeartbeat(ws);
    }
  },
};
