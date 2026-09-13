import { DEFAULT_SOCKETIO_URL } from "@/lib/playground-env";

export const MF_ID_HEADER = "X-MF-ID";
export const REST_API_PREFIX = "/api/";

export const DEFAULT_API_BASE_URL = "http://localhost:4000";
export const DEFAULT_SOCKETIO_BASE_URL = DEFAULT_SOCKETIO_URL;

export function toWebSocketOrigin(httpOrigin: string): string {
  return httpOrigin.replace(/\/$/, "").replace(/^http/i, "ws");
}

export const MF_ID_STORAGE_KEY = "mf_id";
export const SCHEMA_SIDEBAR_STORAGE_KEY = "mf_schema_sidebar_open";
