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
declare global {
  namespace Hono {
    interface ContextData {
      mfId: string;
      isIpFallback: boolean;
    }
  }
}

export {};
