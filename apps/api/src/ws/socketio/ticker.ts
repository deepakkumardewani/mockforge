import type { Namespace, Socket } from "socket.io";
import { createTickerBook, nextStockTick, TICKER_EVENT } from "../ticker-book";
import { admitRealtimeSocket } from "./admit";

const TICK_INTERVAL_MS = 1000;

const tickIntervals: ReturnType<typeof setInterval>[] = [];

export function stopTickerNamespace(): void {
  for (const interval of tickIntervals) clearInterval(interval);
  tickIntervals.length = 0;
}

export function registerTickerNamespace(ns: Namespace): void {
  const book = createTickerBook();

  function emitTick(target: Namespace | Socket): void {
    target.emit(TICKER_EVENT, nextStockTick(book));
  }

  const interval = setInterval(() => {
    try {
      if (ns.sockets.size === 0) return;
      emitTick(ns);
    } catch (error) {
      console.error("[sio/ticker] emit failed", error);
    }
  }, TICK_INTERVAL_MS);
  tickIntervals.push(interval);

  ns.on("connection", (socket) => {
    if (!admitRealtimeSocket(socket)) return;
    console.log("Ticker Client connected");
    try {
      emitTick(socket);
    } catch (error) {
      console.error("[sio/ticker] start failed", error);
    }
  });
}
