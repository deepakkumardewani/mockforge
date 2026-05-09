import type { Namespace } from "socket.io";
import { generateStocks } from "../../data/generators/stocks";
import { DEFAULT_WS_PARAMS } from "../types";
import type { Stock } from "@mockforge/types";

const TICK_INTERVAL_MS = 1000;
const SYMBOL_COUNT = 10;

export function registerTickerNamespace(ns: Namespace): void {
  let connectedClients = 0;
  let tickInterval: ReturnType<typeof setInterval> | null = null;
  let basePrices: Record<string, number> = {};
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
      const ticked = applyFluctuation(baseStocks);
      ns.emit("tick", ticked);
    }, TICK_INTERVAL_MS);
  }

  function stopTicker(): void {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
      basePrices = {};
    }
  }

  ns.on("connection", (socket) => {
    console.log("Ticker Client connected");
    connectedClients++;
    if (connectedClients === 1) startTicker();

    socket.on("disconnect", () => {
      connectedClients--;
      if (connectedClients === 0) stopTicker();
    });
  });
}
