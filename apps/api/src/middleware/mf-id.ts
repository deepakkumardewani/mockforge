import { Context, Next } from "hono";
import { MF_ID_MAX_LENGTH, MF_ID_MIN_LENGTH, MF_ID_PATTERN } from "../lib/limits";

const MF_ID_HEADER = "x-mf-id";

function generateIdFromIp(ip: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(ip);
  const digest = hasher.digest("hex");
  return digest.slice(0, 16);
}

function extractSocketIp(c: Context): string {
  const addr = (c.req.raw as { socket?: { remoteAddress?: string } }).socket?.remoteAddress;
  return addr || "unknown";
}

type ParsedMfId = { status: "missing" } | { status: "invalid" } | { status: "ok"; value: string };

function parseExplicitMfId(headerValue: string | undefined): ParsedMfId {
  if (headerValue === undefined) return { status: "missing" };
  const trimmed = headerValue.trim();
  if (trimmed.length === 0) return { status: "missing" };

  if (
    trimmed.length < MF_ID_MIN_LENGTH ||
    trimmed.length > MF_ID_MAX_LENGTH ||
    !MF_ID_PATTERN.test(trimmed)
  ) {
    return { status: "invalid" };
  }

  return { status: "ok", value: trimmed };
}

export async function mfIdMiddleware(c: Context, next: Next) {
  const parsed = parseExplicitMfId(c.req.header(MF_ID_HEADER));

  if (parsed.status === "invalid") {
    return c.json(
      {
        error: {
          code: "INVALID_MF_ID",
          message: `x-mf-id must be ${MF_ID_MIN_LENGTH}-${MF_ID_MAX_LENGTH} characters matching [A-Za-z0-9_-]`,
        },
      },
      400,
    );
  }

  if (parsed.status === "ok") {
    c.set("mfId", parsed.value);
    c.set("isIpFallback", false);
    await next();
    return;
  }

  // Anonymous: hash the socket address for rate limiting only — never proxy headers.
  c.set("mfId", generateIdFromIp(extractSocketIp(c)));
  c.set("isIpFallback", true);
  await next();
}
