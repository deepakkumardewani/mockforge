import { describe, it, expect, beforeAll } from "vitest";
import { mfIdMiddleware } from "../middleware/mf-id";

// Mock Bun.CryptoHasher before importing middleware
beforeAll(() => {
  (global as any).Bun = {
    CryptoHasher: class MockCryptoHasher {
      private data = "";

      constructor(_algo: string) {
        // algo unused in mock
      }

      update(data: string) {
        this.data = data;
        return this;
      }

      digest(_format: string): string {
        // Simple deterministic hash for testing
        let hash = 0;
        for (let i = 0; i < this.data.length; i++) {
          hash = (hash << 5) - hash + this.data.charCodeAt(i);
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

  constructor(
    headerValue?: string,
    extra?: { headers?: Record<string, string>; remoteAddress?: string | null; noSocket?: boolean },
  ) {
    if (headerValue !== undefined) {
      this.headers["x-mf-id"] = headerValue;
    }
    if (extra?.headers) {
      for (const [key, value] of Object.entries(extra.headers)) {
        this.headers[key.toLowerCase()] = value;
      }
    }
    this.req.raw = extra?.noSocket
      ? {}
      : { socket: { remoteAddress: extra?.remoteAddress ?? "192.168.1.1" } };
  }

  req = {
    header: (name: string) => {
      return this.headers[name.toLowerCase()];
    },
    raw: {} as { socket?: { remoteAddress?: string } },
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

  it("should treat whitespace-only X-MF-ID as missing", async () => {
    const ctx = new MockContext("   ") as any;
    await mfIdMiddleware(ctx, async () => {});
    expect(ctx.get("isIpFallback")).toBe(true);
    expect(ctx.get("mfId")).toHaveLength(16);
  });

  it("should ignore x-forwarded-for and hash the socket peer", async () => {
    const withForward = new MockContext(undefined, {
      headers: { "x-forwarded-for": " 10.0.0.8, 10.0.0.9 " },
    }) as any;
    const withOther = new MockContext(undefined, {
      headers: { "x-forwarded-for": "10.1.1.1" },
    }) as any;

    const differentPeer = new MockContext(undefined, { remoteAddress: "10.9.8.7" }) as any;

    await mfIdMiddleware(withForward, async () => {});
    await mfIdMiddleware(withOther, async () => {});
    await mfIdMiddleware(differentPeer, async () => {});

    expect(withForward.get("isIpFallback")).toBe(true);
    expect(withForward.get("mfId")).toBe(withOther.get("mfId"));
    expect(withForward.get("mfId")).not.toBe(differentPeer.get("mfId"));
  });

  it("should ignore x-real-ip and hash the socket peer", async () => {
    const realIp = new MockContext(undefined, {
      headers: { "x-real-ip": "203.0.113.10" },
    }) as any;
    const socketIp = new MockContext() as any;

    await mfIdMiddleware(realIp, async () => {});
    await mfIdMiddleware(socketIp, async () => {});

    expect(realIp.get("isIpFallback")).toBe(true);
    expect(realIp.get("mfId")).toBe(socketIp.get("mfId"));
  });

  it("should fall back to unknown when no socket address exists", async () => {
    const unknown = new MockContext(undefined, { noSocket: true }) as any;
    const known = new MockContext() as any;

    await mfIdMiddleware(unknown, async () => {});
    await mfIdMiddleware(known, async () => {});

    expect(unknown.get("mfId")).toHaveLength(16);
    expect(unknown.get("mfId")).not.toBe(known.get("mfId"));
  });
});
