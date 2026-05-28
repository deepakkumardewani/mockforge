import { getRedis } from "../db/redis";
import type { BunWs } from "./types";

const BROADCAST_INTERVAL_MS = 2000;
const HEARTBEAT_INTERVAL_MS = 30_000;
const PONG_TIMEOUT_MS = 10_000;

const clients = new Set<BunWs>();
let broadcastInterval: ReturnType<typeof setInterval> | null = null;

async function readTotal(): Promise<number> {
  const raw = await getRedis().get("stats:total_requests");
  return raw !== null ? Number(raw) : 0;
}

async function pushTotalToClients(): Promise<void> {
  try {
    const total = await readTotal();
    const payload = JSON.stringify({ total });

    for (const ws of clients) {
      try {
        ws.send(payload);
      } catch {
        clients.delete(ws);
      }
    }
  } catch {
    // fire-and-forget
  }
}

function startBroadcast(): void {
  if (broadcastInterval) return;

  broadcastInterval = setInterval(() => {
    void pushTotalToClients();
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
    clients.add(ws);
    startBroadcast();
    scheduleHeartbeat(ws);
    void pushTotalToClients();
    console.log(`[ws/stats] client connected`);
  },

  close(ws: BunWs): void {
    clearHeartbeat(ws);
    clients.delete(ws);
    console.log(`[ws/stats] client disconnected`);
  },

  message(ws: BunWs, msg: string | Buffer): void {
    if (msg === "pong") {
      clearHeartbeat(ws);
      scheduleHeartbeat(ws);
    }
  },
};
