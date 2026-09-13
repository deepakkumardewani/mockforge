import { MF_ID_STORAGE_KEY } from "@/lib/playground-constants";

/** RFC 4122 UUID (versions 1–8), matching `crypto.randomUUID()` output. */
export const MF_ID_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RestoreMfIdError = "empty" | "invalid";

export type RestoreMfIdResult = { ok: true; mfId: string } | { ok: false; error: RestoreMfIdError };

export function isValidMfId(value: string): boolean {
  return MF_ID_UUID_PATTERN.test(value.trim());
}

export function persistMfId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MF_ID_STORAGE_KEY, id);
}

export function readPersistedMfId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(MF_ID_STORAGE_KEY);
  if (!stored || !isValidMfId(stored)) return null;
  return stored.trim();
}
