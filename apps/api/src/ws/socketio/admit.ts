import type { Socket } from "socket.io";
import { incrementRequestCounter } from "../../stats/increment-counter";
import { admitConnection, clientKeyFromAddress, releaseConnection } from "../throttle";

export function admitRealtimeSocket(socket: Socket): boolean {
  const key = clientKeyFromAddress(socket.handshake.address);
  if (!admitConnection(key)) {
    if (typeof socket.disconnect === "function") socket.disconnect(true);
    return false;
  }
  incrementRequestCounter();
  socket.on("disconnect", () => {
    releaseConnection(key);
  });
  return true;
}
