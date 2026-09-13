import { create } from "zustand";
import { isValidMfId, persistMfId, type RestoreMfIdResult } from "@/lib/mf-id";

interface MfIdState {
  mfId: string | null;
  setMfId: (id: string) => void;
  restoreMfId: (raw: string) => RestoreMfIdResult;
}

export const useMfIdStore = create<MfIdState>((set) => ({
  mfId: null,
  setMfId: (id: string) => set({ mfId: id }),
  restoreMfId: (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return { ok: false, error: "empty" };
    if (!isValidMfId(trimmed)) return { ok: false, error: "invalid" };
    persistMfId(trimmed);
    set({ mfId: trimmed });
    return { ok: true, mfId: trimmed };
  },
}));
