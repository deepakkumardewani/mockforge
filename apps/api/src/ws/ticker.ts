import type { BunWs } from "./types";
import { sendToClients } from "./client-set";
import { createTickerBook, nextStockTick } from "./ticker-book";

const TICK_INTERVAL_MS = 1000;
const TICKER_TOPIC = "ticker";

const clients = new Set<BunWs>();
let book = createTickerBook();
let tickInterval: ReturnType<typeof setInterval> | null = null;

function buildTickPayload(): string {
  return JSON.stringify(nextStockTick(book));
}

function broadcastTick(): void {
  if (clients.size === 0) return;
  sendToClients(clients, buildTickPayload());
}

function startTicker(): void {
  if (tickInterval) return;

  // Interval is created at module load so Bun does not treat it as a
  // request-scoped timer and cancel it when websocket `open` returns.
  tickInterval = setInterval(() => {
    try {
      broadcastTick();
    } catch (err) {
      console.error("[ws/ticker] broadcast failed", err);
    }
  }, TICK_INTERVAL_MS);
}

startTicker();

export function stopTicker(): void {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
  book = createTickerBook();
  clients.clear();
}

export const tickerWsHandler = {
  open(ws: BunWs): void {
    ws.data.topic = TICKER_TOPIC;
    ws.subscribe(TICKER_TOPIC);
    clients.add(ws);
    startTicker();
    try {
      ws.send(buildTickPayload());
    } catch (err) {
      console.error("[ws/ticker] immediate tick send failed", err);
    }
    console.log(`[ws/ticker] client connected`);
  },

  close(ws: BunWs): void {
    clients.delete(ws);
    ws.unsubscribe(TICKER_TOPIC);
    console.log(`[ws/ticker] client disconnected`);
  },

  message(_ws: BunWs, _msg: string | Buffer): void {
    // ticker is server-push only
  },
};
