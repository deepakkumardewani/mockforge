import { describe, it, expect, beforeEach, vi } from "vitest";
import { createErrorResponse, errorHandler } from "../middleware/error-handler";

class MockContext {
  responseStatus = 200;
  responseBody: unknown = null;

  json(body: unknown, status?: number) {
    this.responseStatus = status ?? 200;
    this.responseBody = body;
    return { status: this.responseStatus, body: this.responseBody };
  }
}

describe("createErrorResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a NOT_FOUND error payload", () => {
    expect(createErrorResponse("NOT_FOUND", "User not found")).toEqual({
      error: { code: "NOT_FOUND", message: "User not found" },
    });
  });

  it("builds a BAD_REQUEST error payload", () => {
    expect(createErrorResponse("BAD_REQUEST", "limit must be a number")).toEqual({
      error: { code: "BAD_REQUEST", message: "limit must be a number" },
    });
  });

  it("builds an UNAUTHORIZED error payload", () => {
    expect(createErrorResponse("UNAUTHORIZED", "Missing X-MF-ID")).toEqual({
      error: { code: "UNAUTHORIZED", message: "Missing X-MF-ID" },
    });
  });

  it("builds an INTERNAL_SERVER_ERROR payload", () => {
    expect(createErrorResponse("INTERNAL_SERVER_ERROR", "boom")).toEqual({
      error: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
    });
  });
});

describe("errorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a 500 JSON body using the error message", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const ctx = new MockContext();
    const err = new Error("schema store failed");

    const result = errorHandler(err, ctx as never);

    expect(ctx.responseStatus).toBe(500);
    expect(ctx.responseBody).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "schema store failed",
      },
    });
    expect(result).toEqual({
      status: 500,
      body: ctx.responseBody,
    });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("falls back to a generic message when the error message is empty", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const ctx = new MockContext();
    const err = new Error("");

    errorHandler(err, ctx as never);

    expect(ctx.responseStatus).toBe(500);
    expect(ctx.responseBody).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    });

    consoleError.mockRestore();
  });
});
