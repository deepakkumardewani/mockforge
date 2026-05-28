import { Server as SocketIoServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { incrementRequestCounter } from "../../stats/increment-counter";
import { registerNotificationsNamespace } from "./notifications";
import { registerChatNamespace } from "./chat";
import { registerTickerNamespace } from "./ticker";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

const isDev = process.env.NODE_ENV !== "production";

export function createSocketIoServer(httpServer: HttpServer): SocketIoServer {
  const io = new SocketIoServer(httpServer, {
    cors: {
      // Allow all origins in dev so browser console / Postman work without restriction
      origin: isDev ? true : [WEB_ORIGIN],
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  for (const namespace of ["/notifications", "/chat", "/ticker"]) {
    const ns = io.of(namespace);
    ns.on("connection", () => {
      incrementRequestCounter();
    });
  }

  registerNotificationsNamespace(io.of("/notifications"));
  registerChatNamespace(io.of("/chat"));
  registerTickerNamespace(io.of("/ticker"));

  console.log("Socket.io server created");
  return io;
}
