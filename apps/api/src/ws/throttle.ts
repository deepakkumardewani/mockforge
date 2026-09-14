import {
  MAX_THROTTLE_KEYS,
  MAX_WS_CONNECTIONS_PER_CLIENT,
  MAX_WS_MESSAGES_PER_WINDOW,
  WS_MESSAGE_WINDOW_MS,
} from "./limits";

/** Process-local native WS bucket when the TCP peer address is unavailable. */
export const NATIVE_WS_CLIENT_KEY = "native";

const connections = new Map<string, number>();
const messages = new Map<string, { count: number; resetAt: number }>();
const pendingOpens = new Map<string, number>();

export function nativeClientKey(address: string | undefined): string {
  const ip = address?.trim();
  if (!ip) return NATIVE_WS_CLIENT_KEY;
  return ip.slice(0, 128);
}

export function clientKeyFromAddress(address: string | undefined): string {
  return nativeClientKey(address);
}

export function admitConnection(key: string): boolean {
  const current = connections.get(key) ?? 0;
  if (current === 0 && connections.size >= MAX_THROTTLE_KEYS) return false;
  if (current >= MAX_WS_CONNECTIONS_PER_CLIENT) return false;
  connections.set(key, current + 1);
  return true;
}

export function releaseConnection(key: string): void {
  const current = connections.get(key);
  if (current === undefined) return;
  if (current <= 1) connections.delete(key);
  else connections.set(key, current - 1);
}

export function notePendingOpen(key: string): void {
  pendingOpens.set(key, (pendingOpens.get(key) ?? 0) + 1);
}

export function consumePendingOpen(key: string): boolean {
  const pending = pendingOpens.get(key) ?? 0;
  if (pending <= 0) return false;
  if (pending === 1) pendingOpens.delete(key);
  else pendingOpens.set(key, pending - 1);
  return true;
}

function evictExpiredMessageBuckets(now: number): void {
  for (const [key, bucket] of messages) {
    if (now >= bucket.resetAt) messages.delete(key);
  }
}

export function admitMessage(key: string): boolean {
  const now = Date.now();
  evictExpiredMessageBuckets(now);

  const bucket = messages.get(key);
  if (!bucket) {
    if (messages.size >= MAX_THROTTLE_KEYS) return false;
    messages.set(key, { count: 1, resetAt: now + WS_MESSAGE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_WS_MESSAGES_PER_WINDOW) return false;
  bucket.count += 1;
  return true;
}
