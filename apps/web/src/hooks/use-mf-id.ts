"use client";

import { useEffect } from "react";
import { useMfIdStore } from "@/store/mf-id";
import { MF_ID_STORAGE_KEY } from "@/lib/playground-constants";

function getOrCreateMfId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(MF_ID_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(MF_ID_STORAGE_KEY, id);
  }
  return id;
}

export function useMfId(): string | null {
  const { mfId, setMfId } = useMfIdStore();

  useEffect(() => {
    if (!mfId) {
      setMfId(getOrCreateMfId());
    }
  }, [mfId, setMfId]);

  return mfId;
}
