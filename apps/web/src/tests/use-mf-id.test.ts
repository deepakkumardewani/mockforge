import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMfId, restoreMfId, isValidMfId } from "@/hooks/use-mf-id";
import { useMfIdStore } from "@/store/mf-id";
import { MF_ID_STORAGE_KEY } from "@/lib/playground-constants";

const VALID_MF_ID = "550e8400-e29b-41d4-a716-446655440000";
const CREATED_MF_ID = "11111111-2222-4333-a444-555555555555";

describe("useMfId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useMfIdStore.setState({ mfId: null });
    vi.spyOn(crypto, "randomUUID").mockReturnValue(CREATED_MF_ID);
  });

  it("re-exports UUID validation from the lib helper", () => {
    expect(isValidMfId(VALID_MF_ID)).toBe(true);
    expect(isValidMfId("nope")).toBe(false);
  });

  it("creates and persists a UUID when nothing is stored", async () => {
    const { result } = renderHook(() => useMfId());

    await waitFor(() => {
      expect(result.current).toBe(CREATED_MF_ID);
    });
    expect(localStorage.getItem(MF_ID_STORAGE_KEY)).toBe(CREATED_MF_ID);
    expect(useMfIdStore.getState().mfId).toBe(CREATED_MF_ID);
  });

  it("hydrates from a valid persisted id instead of creating one", async () => {
    localStorage.setItem(MF_ID_STORAGE_KEY, VALID_MF_ID);

    const { result } = renderHook(() => useMfId());

    await waitFor(() => {
      expect(result.current).toBe(VALID_MF_ID);
    });
    const randomUUID = vi.mocked(crypto.randomUUID);
    expect(randomUUID).not.toHaveBeenCalled();
  });

  it("does not overwrite an id already present in the store", async () => {
    useMfIdStore.setState({ mfId: VALID_MF_ID });

    const { result } = renderHook(() => useMfId());

    expect(result.current).toBe(VALID_MF_ID);
    await waitFor(() => {
      expect(result.current).toBe(VALID_MF_ID);
    });
    const randomUUID = vi.mocked(crypto.randomUUID);
    expect(randomUUID).not.toHaveBeenCalled();
  });
});

describe("restoreMfId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useMfIdStore.setState({ mfId: null });
  });

  it("returns empty when the raw value is blank", () => {
    expect(restoreMfId("   ")).toEqual({ ok: false, error: "empty" });
    expect(useMfIdStore.getState().mfId).toBeNull();
  });

  it("returns invalid for a non-UUID value", () => {
    expect(restoreMfId("not-a-uuid")).toEqual({ ok: false, error: "invalid" });
    expect(useMfIdStore.getState().mfId).toBeNull();
  });

  it("writes a trimmed valid id to the store and localStorage", () => {
    expect(restoreMfId(`  ${VALID_MF_ID}  `)).toEqual({ ok: true, mfId: VALID_MF_ID });
    expect(useMfIdStore.getState().mfId).toBe(VALID_MF_ID);
    expect(localStorage.getItem(MF_ID_STORAGE_KEY)).toBe(VALID_MF_ID);
  });
});
