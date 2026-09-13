"use client";

import { useEffect } from "react";
import { persistMfId, readPersistedMfId } from "@/lib/mf-id";
import { useMfIdStore } from "@/store/mf-id";

export { isValidMfId } from "@/lib/mf-id";
export type { RestoreMfIdError, RestoreMfIdResult } from "@/lib/mf-id";

function createMfId(): string {
  const id = crypto.randomUUID();
  persistMfId(id);
  return id;
}

function getOrCreateMfId(): string {
  return readPersistedMfId() ?? createMfId();
}

/** Initializes anonymous identity on mount. Safe to call from Builder. */
export function useMfId(): string | null {
  const mfId = useMfIdStore((s) => s.mfId);
  const setMfId = useMfIdStore((s) => s.setMfId);

  useEffect(() => {
    if (mfId) return;
    setMfId(getOrCreateMfId());
  }, [mfId, setMfId]);

  return mfId;
}

/** Validates a UUID, then writes localStorage and Zustand immediately. */
export function restoreMfId(raw: string) {
  return useMfIdStore.getState().restoreMfId(raw);
}
