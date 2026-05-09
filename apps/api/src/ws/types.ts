import type { ServerWebSocket, Server } from "bun";

export interface WsData {
  route: string;
  roomId?: string;
  topic?: string;
  pingTimeout?: ReturnType<typeof setTimeout>;
  emitTimer?: ReturnType<typeof setTimeout>;
}

export type BunServer = Server<WsData>;
export type BunWs = ServerWebSocket<WsData>;

/** Minimal pagination for WS generators — order default is "asc" */
export const DEFAULT_WS_PARAMS = { limit: 1, skip: 0, order: "asc" as const };
