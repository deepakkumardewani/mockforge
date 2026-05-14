import { describe, it, expect, beforeEach } from "vitest";
import { useMfIdStore } from "@/store/mf-id";

describe("useMfIdStore", () => {
  beforeEach(() => {
    useMfIdStore.setState({ mfId: null });
  });

  it("initializes with null mfId", () => {
    expect(useMfIdStore.getState().mfId).toBeNull();
  });

  it("setMfId updates the mfId", () => {
    useMfIdStore.getState().setMfId("abc-123");
    expect(useMfIdStore.getState().mfId).toBe("abc-123");
  });
});
