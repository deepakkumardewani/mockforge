import { describe, it, expect } from "vitest";
import { formatJson, isJsonValid } from "@/components/playground/shared/json";

describe("playground json helpers", () => {
  it("treats empty and whitespace-only text as valid JSON", () => {
    expect(isJsonValid("")).toBe(true);
    expect(isJsonValid("   \n\t")).toBe(true);
  });

  it("accepts parseable JSON", () => {
    expect(isJsonValid('{"a":1}')).toBe(true);
    expect(isJsonValid("[1, 2]")).toBe(true);
  });

  it("rejects invalid JSON", () => {
    expect(isJsonValid("{")).toBe(false);
    expect(isJsonValid('{"a": }')).toBe(false);
  });

  it("pretty-prints valid JSON with two-space indent", () => {
    expect(formatJson('{"name":"Ada","n":1}')).toBe('{\n  "name": "Ada",\n  "n": 1\n}');
  });

  it("returns the original text when formatting fails", () => {
    const invalid = '{"name": "Ada",';
    expect(formatJson(invalid)).toBe(invalid);
  });
});
