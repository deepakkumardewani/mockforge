import type { Namespace, Socket } from "socket.io";
import { createTickerBook, nextStockTick, TICKER_EVENT } from "../ticker-book";

const TICK_INTERVAL_MS = 1000;

export function registerTickerNamespace(ns: Namespace): void {
  const book = createTickerBook();

  function emitTick(target: Namespace | Socket): void {
    target.emit(TICKER_EVENT, nextStockTick(book));
  }

  setInterval(() => {
    try {
      if (ns.sockets.size === 0) return;
      emitTick(ns);
    } catch (error) {
      console.error("[sio/ticker] emit failed", error);
    }
  }, TICK_INTERVAL_MS);

  ns.on("connection", (socket) => {
    console.log("Ticker Client connected");
    try {
      emitTick(socket);
    } catch (error) {
      console.error("[sio/ticker] start failed", error);
    }
  });
}
