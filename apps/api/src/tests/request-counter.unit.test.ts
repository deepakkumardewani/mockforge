import { describe, it, expect, beforeEach, vi } from "vitest";
import { requestCounterMiddleware } from "../middleware/request-counter";

// Mock Redis
const mockIncr = vi.fn();
vi.mock("../db/redis", () => ({
  getRedis: () => ({
    incr: mockIncr,
  }),
}));

// Mock Context
class MockContext {
  res = {
    status: 200,
  };

  async json(body: any, status?: number) {
    this.res.status = status || 200;
    return { body };
  }
}

describe("Request Counter Middleware", () => {
  beforeEach(() => {
    mockIncr.mockClear();
    vi.clearAllTimers();
  });

  it("should increment counter on 2xx response", async () => {
    const ctx = new MockContext() as any;
    ctx.res.status = 200;

    const next = async () => {};

    await requestCounterMiddleware(ctx, next);

    // Give async task time to fire
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockIncr).toHaveBeenCalledWith("stats:total_requests");
  });

  it("should increment counter on 201 Created", async () => {
    const ctx = new MockContext() as any;
    ctx.res.status = 201;

    const next = async () => {};

    await requestCounterMiddleware(ctx, next);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockIncr).toHaveBeenCalledWith("stats:total_requests");
  });

  it("should not increment counter on 3xx response", async () => {
    const ctx = new MockContext() as any;
    ctx.res.status = 301;

    const next = async () => {};

    await requestCounterMiddleware(ctx, next);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockIncr).not.toHaveBeenCalled();
  });

  it("should not increment counter on 4xx response", async () => {
    const ctx = new MockContext() as any;
    ctx.res.status = 400;

    const next = async () => {};

    await requestCounterMiddleware(ctx, next);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockIncr).not.toHaveBeenCalled();
  });

  it("should not increment counter on 5xx response", async () => {
    const ctx = new MockContext() as any;
    ctx.res.status = 500;

    const next = async () => {};

    await requestCounterMiddleware(ctx, next);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockIncr).not.toHaveBeenCalled();
  });

  it("should not await counter increment", async () => {
    const ctx = new MockContext() as any;
    ctx.res.status = 200;

    mockIncr.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(1), 100);
        })
    );

    const next = async () => {};

    const start = Date.now();
    await requestCounterMiddleware(ctx, next);
    const elapsed = Date.now() - start;

    // Should not wait for the async increment (should be < 50ms)
    expect(elapsed).toBeLessThan(50);
  });
});
