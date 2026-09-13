import type { Namespace } from "socket.io";
import { generateStocks } from "../../data/generators/stocks";
import { DEFAULT_WS_PARAMS } from "../types";
import type { Stock } from "@mockforge/types";

const TICK_INTERVAL_MS = 1000;
const SYMBOL_COUNT = 10;

export function registerTickerNamespace(ns: Namespace): void {
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

  function emitTick(): void {
    ns.emit("tick", applyFluctuation(baseStocks));
  }

  baseStocks = generateStocks({ ...DEFAULT_WS_PARAMS, limit: SYMBOL_COUNT });
  for (const s of baseStocks) basePrices[s.symbol] = s.price;

  setInterval(() => {
    try {
      if (ns.sockets.size === 0) return;
      emitTick();
    } catch (error) {
      console.error("[sio/ticker] emit failed", error);
    }
  }, TICK_INTERVAL_MS);

  ns.on("connection", (socket) => {
    console.log("Ticker Client connected");
    try {
      socket.emit("tick", applyFluctuation(baseStocks));
    } catch (error) {
      console.error("[sio/ticker] start failed", error);
    }

    socket.on("disconnect", () => {
      // interval stays alive at namespace scope
    });
  });
}
