import { describe, it, expect } from "vitest";
import { DEFAULT_CHAT_ROOM_ID, decodePathRoomId, normalizeRoomId, roomIdFromQuery } from "./room";

describe("normalizeRoomId", () => {
  it("returns the default room for empty input", () => {
    expect(normalizeRoomId("   ")).toBe(DEFAULT_CHAT_ROOM_ID);
  });

  it("accepts valid room ids", () => {
    expect(normalizeRoomId("lobby-1")).toBe("lobby-1");
  });

  it("rejects ids that are too long", () => {
    expect(normalizeRoomId("x".repeat(65))).toBeNull();
  });

  it("rejects ids with invalid characters", () => {
    expect(normalizeRoomId("bad room!")).toBeNull();
  });
});

describe("decodePathRoomId", () => {
  it("decodes URI-encoded segments", () => {
    expect(decodePathRoomId("room%2Dalpha")).toBe("room-alpha");
  });

  it("returns null for malformed percent-encoding", () => {
    expect(decodePathRoomId("%")).toBeNull();
  });
});

describe("roomIdFromQuery", () => {
  it("defaults when query is undefined", () => {
    expect(roomIdFromQuery(undefined)).toBe(DEFAULT_CHAT_ROOM_ID);
  });

  it("uses the first value when query is an array", () => {
    expect(roomIdFromQuery(["first", "second"])).toBe("first");
  });

  it("normalizes invalid room ids to null", () => {
    expect(roomIdFromQuery("!!!")).toBeNull();
  });
});
