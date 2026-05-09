import { Context } from "hono";

export type ErrorCode =
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED";

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export function createErrorResponse(
  code: ErrorCode,
  message: string
): ErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}

export function errorHandler(err: Error, c: Context) {
  console.error(
    `[Error] ${err.message}`,
    err instanceof Error ? err.stack : ""
  );

  const response = createErrorResponse(
    "INTERNAL_SERVER_ERROR",
    err.message || "An unexpected error occurred"
  );

  return c.json(response, 500);
}
