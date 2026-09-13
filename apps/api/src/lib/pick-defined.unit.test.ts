import { describe, it, expect, beforeEach, vi } from "vitest";
import { pickDefined } from "./pick-defined";

describe("pickDefined", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps defined string, number, and boolean values", () => {
    const result = pickDefined({
      name: "Ada",
      age: 36,
      active: true,
    });

    expect(result).toEqual({ name: "Ada", age: 36, active: true });
  });

  it("omits null values", () => {
    const result = pickDefined({
      title: "Todo",
      notes: null,
    });

    expect(result).toEqual({ title: "Todo" });
    expect(result).not.toHaveProperty("notes");
  });

  it("omits undefined values", () => {
    const result = pickDefined({
      title: "Todo",
      notes: undefined,
    });

    expect(result).toEqual({ title: "Todo" });
    expect(result).not.toHaveProperty("notes");
  });

  it("returns an empty object when every value is null or undefined", () => {
    const result = pickDefined({
      a: null,
      b: undefined,
    });

    expect(result).toEqual({});
  });

  it("returns an empty object for an empty input", () => {
    expect(pickDefined({})).toEqual({});
  });

  it("keeps falsy values that are not null or undefined", () => {
    const result = pickDefined({
      count: 0,
      label: "",
      enabled: false,
    });

    expect(result).toEqual({ count: 0, label: "", enabled: false });
  });

  it("keeps nested objects and arrays as-is", () => {
    const address = { city: "Berlin" };
    const tags = ["api"];

    const result = pickDefined({
      address,
      tags,
      missing: null,
    });

    expect(result.address).toBe(address);
    expect(result.tags).toBe(tags);
    expect(result).not.toHaveProperty("missing");
  });
});
