import { describe, it, expect, beforeEach, vi } from "vitest";

// Track request counts per test
let requestCounts: Record<string, number> = {};

// Mock Redis
vi.mock("../db/redis", () => ({
  getRedis: () => ({
    incr: async (key: string) => {
      requestCounts[key] = (requestCounts[key] || 0) + 1;
      return requestCounts[key];
    },
    expire: async (_key: string, _seconds: number) => 1,
  }),
}));

// Import after mocks
import { rateLimitMiddleware } from "../middleware/rate-limit";

// Mock Context
class MockContext {
  private vars: Record<string, any> = {};
  private headers: Record<string, string> = {};
  private responseHeaders: Record<string, string> = {};
  private responseStatus: number = 200;
  private responseBody: any = null;

  constructor(mfId: string, isIpFallback: boolean = false) {
    this.vars["mfId"] = mfId;
    this.vars["isIpFallback"] = isIpFallback;
  }

  req = {
    header: (name: string) => this.headers[name.toLowerCase()],
  };

  set(key: string, value: any) {
    this.vars[key] = value;
  }

  get(key: string) {
    return this.vars[key];
  }

  header(key: string, value: string) {
    this.responseHeaders[key] = value;
    return this;
  }

  json(body: any, status?: number, headers?: Record<string, string>) {
    this.responseStatus = status || 200;
    this.responseBody = body;
    if (headers) {
      Object.assign(this.responseHeaders, headers);
    }
    return {
      status: this.responseStatus,
      body: this.responseBody,
    };
  }

  getResponseStatus() {
    return this.responseStatus;
  }

  getResponseHeaders() {
    return this.responseHeaders;
  }
}

describe("Rate Limit Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCounts = {}; // Reset request counts before each test
  });

  it("should increment counter on each request", async () => {
    const ctx = new MockContext("test-user") as any;
    let nextCalled = false;

    const next = async () => {
      nextCalled = true;
    };

    await rateLimitMiddleware(ctx, next);

    expect(nextCalled).toBe(true);
    expect(ctx.getResponseStatus()).toBe(200);
  });

  it("should set rate limit headers correctly for identified users (300/min)", async () => {
    const ctx = new MockContext("test-user", false) as any;

    const next = async () => {};

    await rateLimitMiddleware(ctx, next);

    const headers = ctx.getResponseHeaders();
    expect(headers["x-ratelimit-limit"]).toBe("300");
    expect(headers["x-ratelimit-remaining"]).toBe("299");
    expect(headers["x-ratelimit-reset"]).toBeDefined();
  });

  it("should set rate limit headers correctly for IP fallback users (60/min)", async () => {
    const ctx = new MockContext("test-ip", true) as any;

    const next = async () => {};

    await rateLimitMiddleware(ctx, next);

    const headers = ctx.getResponseHeaders();
    expect(headers["x-ratelimit-limit"]).toBe("60");
    expect(headers["x-ratelimit-remaining"]).toBe("59");
  });

  it("should return 429 when limit exceeded for identified users", async () => {
    // Simulate 301 requests to exceed 300/min limit
    const ctx = new MockContext("limit-test", false) as any;

    let callCount = 0;
    const next = async () => {
      callCount++;
    };

    // Make 301 requests
    for (let i = 0; i < 301; i++) {
      const testCtx = new MockContext("limit-test", false) as any;
      testCtx.json = ctx.json.bind(testCtx);
      testCtx.header = ctx.header.bind(testCtx);
      testCtx.get = (key: string) => {
        if (key === "mfId") return "limit-test";
        if (key === "isIpFallback") return false;
      };
      testCtx.set = () => {};
      testCtx.req = ctx.req;

      await rateLimitMiddleware(testCtx, next);

      if (i === 300) {
        // 301st request should be rate limited
        expect(testCtx.getResponseStatus()).toBe(429);
      }
    }

    // Verify next was called 300 times
    expect(callCount).toBe(300);
  });
});
