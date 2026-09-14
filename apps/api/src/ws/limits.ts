/** Shared frame/message ceiling for native WS and Socket.IO. */
export const WS_MAX_PAYLOAD_BYTES = 64 * 1024;

export const MAX_WS_CONNECTIONS_PER_CLIENT = 256;
export const WS_MESSAGE_WINDOW_MS = 60_000;
export const MAX_WS_MESSAGES_PER_WINDOW = 120;
export const MAX_THROTTLE_KEYS = 4096;
