import { create } from "zustand";

interface MfIdState {
  mfId: string | null;
  setMfId: (id: string) => void;
}

export const useMfIdStore = create<MfIdState>((set) => ({
  mfId: null,
  setMfId: (id: string) => set({ mfId: id }),
}));
