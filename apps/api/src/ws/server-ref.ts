import type { BunServer } from "./types";

let _server: BunServer | null = null;

export function setServer(s: BunServer): void {
  _server = s;
}

export function getServer(): BunServer {
  if (!_server) throw new Error("Bun server not yet initialised");
  return _server;
}
