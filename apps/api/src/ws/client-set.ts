import type { BunWs } from "./types";

/** Send a text frame to every live socket; drop sockets that error on send. */
export function sendToClients(clients: Set<BunWs>, payload: string): void {
  for (const ws of clients) {
    try {
      ws.send(payload);
    } catch {
      clients.delete(ws);
    }
  }
}
