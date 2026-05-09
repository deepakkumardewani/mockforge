import { describe, it, expect, vi, beforeAll } from "vitest";
import { mfIdMiddleware } from "../middleware/mf-id";
import { Context } from "hono";

// Mock Bun.CryptoHasher before importing middleware
beforeAll(() => {
  (global as any).Bun = {
    CryptoHasher: class MockCryptoHasher {
      private data = "";

      constructor(algo: string) {
        // algo unused in mock
      }

      update(data: string) {
        this.data = data;
        return this;
      }

      digest(format: string): string {
        // Simple deterministic hash for testing
        let hash = 0;
        for (let i = 0; i < this.data.length; i++) {
          hash = ((hash << 5) - hash) + this.data.charCodeAt(i);
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(16, "0");
      }
    },
  };
});

// Mock Context
class MockContext {
  private vars: Record<string, any> = {};
  private headers: Record<string, string> = {};

  constructor(headerValue?: string) {
    if (headerValue) {
      this.headers["x-mf-id"] = headerValue;
    }
  }

  req = {
    header: (name: string) => {
      return this.headers[name.toLowerCase()];
    },
    raw: {
      socket: {
        remoteAddress: "192.168.1.1",
      },
    },
  };

  set(key: string, value: any) {
    this.vars[key] = value;
  }

  get(key: string) {
    return this.vars[key];
  }
}

describe("MF-ID Middleware", () => {
  it("should use X-MF-ID header when present", async () => {
    const ctx = new MockContext("user-123") as any;
    let nextCalled = false;

    const next = async () => {
      nextCalled = true;
    };

    await mfIdMiddleware(ctx, next);

    expect(ctx.get("mfId")).toBe("user-123");
    expect(ctx.get("isIpFallback")).toBe(false);
    expect(nextCalled).toBe(true);
  });

  it("should generate sha256 hash from IP when header absent", async () => {
    const ctx = new MockContext() as any;
    let nextCalled = false;

    const next = async () => {
      nextCalled = true;
    };

    await mfIdMiddleware(ctx, next);

    const mfId = ctx.get("mfId");
    expect(mfId).toBeDefined();
    expect(mfId.length).toBe(16); // First 16 chars of sha256 hex
    expect(ctx.get("isIpFallback")).toBe(true);
    expect(nextCalled).toBe(true);
  });

  it("should ignore empty X-MF-ID header and use IP fallback", async () => {
    const ctx = new MockContext("") as any;
    let nextCalled = false;

    const next = async () => {
      nextCalled = true;
    };

    await mfIdMiddleware(ctx, next);

    const mfId = ctx.get("mfId");
    expect(mfId.length).toBe(16);
    expect(ctx.get("isIpFallback")).toBe(true);
    expect(nextCalled).toBe(true);
  });
});
