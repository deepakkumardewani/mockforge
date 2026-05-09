import { Context, Next } from "hono";

const MF_ID_HEADER = "x-mf-id";

function generateIdFromIp(ip: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(ip);
  const digest = hasher.digest("hex");
  return digest.slice(0, 16);
}

function extractClientIp(c: Context): string {
  // Try common proxy headers first
  const forwardedFor = c.req.header("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = c.req.header("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (Bun specific)
  const addr = (c.req.raw as any).socket?.remoteAddress;
  return addr || "unknown";
}

export async function mfIdMiddleware(c: Context, next: Next) {
  const headerValue = c.req.header(MF_ID_HEADER);

  let resolvedId: string;
  let isIpFallback: boolean;

  if (headerValue && headerValue.trim().length > 0) {
    resolvedId = headerValue;
    isIpFallback = false;
  } else {
    const clientIp = extractClientIp(c);
    resolvedId = generateIdFromIp(clientIp);
    isIpFallback = true;
  }

  c.set("mfId", resolvedId);
  c.set("isIpFallback", isIpFallback);

  await next();
}
