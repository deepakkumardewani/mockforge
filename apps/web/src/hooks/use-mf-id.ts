"use client";

import { useEffect } from "react";
import { useMfIdStore } from "@/store/mf-id";

const STORAGE_KEY = "mf_id";

function getOrCreateMfId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
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
