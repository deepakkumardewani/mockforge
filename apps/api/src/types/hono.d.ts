import { Context } from "hono";

declare global {
  interface HonoRequest {
    // Add custom request properties if needed
  }
}

declare module "hono" {
  interface HonoRequest {
    // Add custom request properties if needed
  }
}

// Extend Hono Context to support our custom properties
declare module "hono" {
  interface ContextVariableMap {
    mfId: string;
    isIpFallback: boolean;
  }
}

export {};
