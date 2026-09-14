import { Server as SocketIoServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { registerNotificationsNamespace, stopNotificationsNamespace } from "./notifications";
import { registerChatNamespace, stopChatNamespace } from "./chat";
import { registerTickerNamespace, stopTickerNamespace } from "./ticker";
import { WS_MAX_PAYLOAD_BYTES } from "../limits";

export function stopSocketIoRuntime(): void {
  stopChatNamespace();
  stopNotificationsNamespace();
  stopTickerNamespace();
}

function socketIoCorsOrigin(): boolean | string[] {
  const isProd = process.env.NODE_ENV === "production";
  const configuredOrigins = (process.env.WEB_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  if (isProd && configuredOrigins.length > 0) return configuredOrigins;
  return true;
}

export function createSocketIoServer(httpServer: HttpServer): SocketIoServer {
  const io = new SocketIoServer(httpServer, {
    cors: {
      origin: socketIoCorsOrigin(),
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
    maxHttpBufferSize: WS_MAX_PAYLOAD_BYTES,
  });

  registerNotificationsNamespace(io.of("/notifications"));
  registerChatNamespace(io.of("/chat"));
  registerTickerNamespace(io.of("/ticker"));

  console.log("Socket.io server created");
  return io;
}
