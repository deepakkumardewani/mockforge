import { describe, it, expect, vi, beforeEach } from "vitest";
import { MF_ID_UUID_PATTERN, isValidMfId, persistMfId, readPersistedMfId } from "@/lib/mf-id";
import { MF_ID_STORAGE_KEY } from "@/lib/playground-constants";

const VALID_MF_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("mf-id helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("accepts a trimmed RFC 4122 UUID", () => {
    expect(isValidMfId(`  ${VALID_MF_ID}  `)).toBe(true);
    expect(MF_ID_UUID_PATTERN.test(VALID_MF_ID)).toBe(true);
  });

  it("rejects empty, malformed, and out-of-range UUID versions", () => {
    expect(isValidMfId("")).toBe(false);
    expect(isValidMfId("not-a-uuid")).toBe(false);
    expect(isValidMfId("550e8400-e29b-01d4-a716-446655440000")).toBe(false);
    expect(isValidMfId("550e8400-e29b-41d4-c716-446655440000")).toBe(false);
  });

  it("persists the id under the shared storage key", () => {
    persistMfId(VALID_MF_ID);
    expect(localStorage.getItem(MF_ID_STORAGE_KEY)).toBe(VALID_MF_ID);
  });

  it("reads a valid persisted id after trimming", () => {
    localStorage.setItem(MF_ID_STORAGE_KEY, `  ${VALID_MF_ID}  `);
    expect(readPersistedMfId()).toBe(VALID_MF_ID);
  });

  it("returns null when storage is empty or the value is invalid", () => {
    expect(readPersistedMfId()).toBeNull();
    localStorage.setItem(MF_ID_STORAGE_KEY, "bad-id");
    expect(readPersistedMfId()).toBeNull();
  });
});
