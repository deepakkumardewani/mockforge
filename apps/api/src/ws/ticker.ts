import { generateStocks } from "../data/generators/stocks";
import type { Stock } from "@mockforge/types";
import type { BunWs } from "./types";
import { DEFAULT_WS_PARAMS } from "./types";
import { sendToClients } from "./client-set";

const TICK_INTERVAL_MS = 1000;
const TICKER_TOPIC = "ticker";
const SYMBOL_COUNT = 10;

const clients = new Set<BunWs>();
let basePrices: Record<string, number> = {};
let tickInterval: ReturnType<typeof setInterval> | null = null;
let baseStocks: Stock[] = [];

function applyFluctuation(stocks: Stock[]): Stock[] {
  return stocks.map((s) => {
    const fluctPct = (Math.random() * 2.5 - 0.5) / 100;
    const newPrice = parseFloat((basePrices[s.symbol] * (1 + fluctPct)).toFixed(2));
    basePrices[s.symbol] = newPrice;
    const change = parseFloat((newPrice - s.open).toFixed(2));
    const changePercent = parseFloat(((change / s.open) * 100).toFixed(2));
    return { ...s, price: newPrice, change, changePercent };
  });
}

function buildTickPayload(): string {
  return JSON.stringify(applyFluctuation(baseStocks));
}

function broadcastTick(): void {
  if (clients.size === 0) return;
  sendToClients(clients, buildTickPayload());
}

function startTicker(): void {
  if (tickInterval) return;

  baseStocks = generateStocks({ ...DEFAULT_WS_PARAMS, limit: SYMBOL_COUNT });
  for (const s of baseStocks) basePrices[s.symbol] = s.price;

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
    basePrices = {};
  }
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
