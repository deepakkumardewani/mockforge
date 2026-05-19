import { describe, it, expect } from "vitest";
import { mergeGeneratedRow, MOCK_GENERATE_PARAMS } from "./mock-merge";
import { pickDefined } from "./pick-defined";

describe("pickDefined", () => {
  it("omits null and undefined keys", () => {
    expect(pickDefined({ a: "x", b: null, c: undefined, d: 0 })).toEqual({ a: "x", d: 0 });
  });
});

describe("mergeGeneratedRow", () => {
  it("shallow-merges overlay onto generated row", () => {
    const row = mergeGeneratedRow(
      () => [{ id: "1", title: "Generated" }],
      { title: "Caller", id: "99" },
    );
    expect(row).toEqual({ id: "99", title: "Caller" });
    expect(MOCK_GENERATE_PARAMS).toEqual({ limit: 1, skip: 0, order: "asc" });
  });
});
