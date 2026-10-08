import { describe, it, expect } from "vitest";
import { findSeededById, findSeededByIdRest } from "./seeded-lookup";
import type { PaginationParams } from "./pagination";

function generate(params: PaginationParams) {
  const start = params.skip;
  const end = start + params.limit;
  return Array.from({ length: end - start }, (_, index) => ({
    id: String(start + index + 1),
    label: `row-${start + index + 1}`,
  }));
}

describe("findSeededById", () => {
  it("returns the row at the numeric id index", () => {
    expect(findSeededById(generate, "3")).toEqual({ id: "3", label: "row-3" });
  });

  it("returns null for non-integer ids", () => {
    expect(findSeededById(generate, "abc")).toBeNull();
    expect(findSeededById(generate, "1.5")).toBeNull();
  });

  it("returns null for zero or negative ids", () => {
    expect(findSeededById(generate, "0")).toBeNull();
    expect(findSeededById(generate, "-2")).toBeNull();
  });

  it("returns null when the generator yields no row for that skip", () => {
    const bounded = (params: PaginationParams) => (params.skip >= 5 ? [] : generate(params));
    expect(findSeededById(bounded, "6")).toBeNull();
  });
});

describe("findSeededByIdRest", () => {
  it("returns the row at the numeric id index", () => {
    expect(findSeededByIdRest(generate, "2")).toEqual({ id: "2", label: "row-2" });
  });

  it("falls back to the first row for non-numeric ids", () => {
    expect(findSeededByIdRest(generate, "not-a-number")).toEqual({ id: "1", label: "row-1" });
  });

  it("falls back to the first row for non-positive numeric ids", () => {
    expect(findSeededByIdRest(generate, "0")).toEqual({ id: "1", label: "row-1" });
  });
});
