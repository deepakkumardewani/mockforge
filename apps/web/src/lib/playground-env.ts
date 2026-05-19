/** Default Socket.IO gateway when `NEXT_PUBLIC_SOCKETIO_URL` is unset. */
export const DEFAULT_SOCKETIO_URL = "http://localhost:4001";

export function getSocketIoBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SOCKETIO_URL;
  return typeof fromEnv === "string" && fromEnv.trim().length > 0
    ? fromEnv.trim()
    : DEFAULT_SOCKETIO_URL;
}
