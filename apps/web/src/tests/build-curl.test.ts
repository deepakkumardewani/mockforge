import { describe, it, expect } from "vitest";
import { buildCurl } from "@/components/playground/rest/build-curl";

describe("buildCurl", () => {
  it("builds a GET command with no headers or body", () => {
    expect(buildCurl({ method: "get", url: "http://localhost:4000/api/users", headers: {} })).toBe(
      "curl -X 'GET' 'http://localhost:4000/api/users'",
    );
  });

  it("includes headers in insertion order", () => {
    const cmd = buildCurl({
      method: "POST",
      url: "http://localhost:4000/api/users",
      headers: { "Content-Type": "application/json", "X-MF-ID": "abc" },
    });
    expect(cmd).toBe(
      "curl -X 'POST' -H 'Content-Type: application/json' -H 'X-MF-ID: abc' 'http://localhost:4000/api/users'",
    );
  });

  it("includes a non-empty body as --data", () => {
    const cmd = buildCurl({
      method: "POST",
      url: "http://localhost:4000/api/users",
      headers: {},
      body: '{"name":"a"}',
    });
    expect(cmd).toBe("curl -X 'POST' --data '{\"name\":\"a\"}' 'http://localhost:4000/api/users'");
  });

  it("omits --data for an empty or whitespace-only body", () => {
    const cmd = buildCurl({ method: "GET", url: "http://x", headers: {}, body: "   " });
    expect(cmd).not.toContain("--data");
  });

  it("skips headers with blank names", () => {
    const cmd = buildCurl({ method: "GET", url: "http://x", headers: { "": "value" } });
    expect(cmd).not.toContain("-H");
  });

  it("escapes embedded single quotes safely", () => {
    const cmd = buildCurl({
      method: "POST",
      url: "http://x",
      headers: {},
      body: "it's a test",
    });
    expect(cmd).toBe("curl -X 'POST' --data 'it'\\''s a test' 'http://x'");
  });
});
