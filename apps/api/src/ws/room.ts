export const DEFAULT_CHAT_ROOM_ID = "default";
export const WS_ROOM_ID_MAX_LENGTH = 64;
export const WS_ROOM_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function normalizeRoomId(raw: string): string | null {
  const roomId = raw.trim();
  if (roomId.length === 0) return DEFAULT_CHAT_ROOM_ID;
  if (roomId.length > WS_ROOM_ID_MAX_LENGTH) return null;
  if (!WS_ROOM_ID_PATTERN.test(roomId)) return null;
  return roomId;
}

export function decodePathRoomId(segment: string): string | null {
  try {
    return normalizeRoomId(decodeURIComponent(segment));
  } catch {
    return null;
  }
}

/** Socket.IO query values are `string | string[]`; use the first entry only. */
export function roomIdFromQuery(value: string | string[] | undefined): string | null {
  if (value === undefined) return DEFAULT_CHAT_ROOM_ID;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return DEFAULT_CHAT_ROOM_ID;
  return normalizeRoomId(raw);
}
