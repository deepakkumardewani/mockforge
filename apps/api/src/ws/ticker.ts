import { generateStocks } from "../data/generators/stocks";
import type { Stock } from "@mockforge/types";
import type { BunWs } from "./types";
import { DEFAULT_WS_PARAMS } from "./types";
import { getServer } from "./server-ref";

const TICK_INTERVAL_MS = 1000;
const TICKER_TOPIC = "ticker";
const SYMBOL_COUNT = 10;

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

function startTicker(): void {
  if (tickInterval) return;

  baseStocks = generateStocks({ ...DEFAULT_WS_PARAMS, limit: SYMBOL_COUNT });
  for (const s of baseStocks) basePrices[s.symbol] = s.price;

  tickInterval = setInterval(() => {
    try {
      const ticked = applyFluctuation(baseStocks);
      // server.publish sends to ALL subscribers
      getServer().publish(TICKER_TOPIC, JSON.stringify(ticked));
    } catch {
      // fire-and-forget
    }
  }, TICK_INTERVAL_MS);
}

export function stopTicker(): void {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
    basePrices = {};
  }
}

export const tickerWsHandler = {
  open(ws: BunWs): void {
    ws.data.topic = TICKER_TOPIC;
    ws.subscribe(TICKER_TOPIC);
    startTicker();
    console.log(`[ws/ticker] client connected`);
  },

  close(ws: BunWs): void {
    ws.unsubscribe(TICKER_TOPIC);
    console.log(`[ws/ticker] client disconnected`);
  },

  message(_ws: BunWs, _msg: string | Buffer): void {
    // ticker is server-push only
  },
};
