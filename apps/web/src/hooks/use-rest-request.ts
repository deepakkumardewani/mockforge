"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api-client";

export type RestHttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RestResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  body: unknown;
  headers: Record<string, string>;
}

export interface RestRequestInput {
  method: RestHttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export function resolveRestUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

function buildHeaders(init: Record<string, string>, mfId: string | null): Headers {
  const h = new Headers();
  Object.entries(init).forEach(([k, v]) => {
    if (k.trim()) h.set(k.trim(), v);
  });
  if (mfId) {
    h.set("X-MF-ID", mfId);
  }
  return h;
}

export async function sendRestFetch(
  input: RestRequestInput,
  mfId: string | null,
): Promise<RestResponseData> {
  const start = performance.now();
  const resolved = resolveRestUrl(input.url);
  const trimmed = input.body?.trim() ?? "";
  const bodyPayload = input.method === "GET" || trimmed.length === 0 ? undefined : trimmed;

  const headerMap = { ...input.headers };
  if (bodyPayload) {
    const hasCt = Object.keys(headerMap).some((k) => k.toLowerCase() === "content-type");
    if (!hasCt) headerMap["Content-Type"] = "application/json";
  }
  const hdrs = buildHeaders(headerMap, mfId);
  const res = await fetch(resolved, {
    method: input.method,
    headers: hdrs,
    body: bodyPayload,
  });

  const timeMs = Math.round(performance.now() - start);
  const text = await res.text();
  let body: unknown = text.length ? text : null;
  if (text.trim().length) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return {
    status: res.status,
    statusText: res.statusText,
    timeMs,
    body,
    headers,
  };
}

export function useRestRequest(mfId: string | null) {
  const mutation = useMutation({
    mutationFn: (input: RestRequestInput) => sendRestFetch(input, mfId),
  });

  return {
    send: mutation.mutateAsync,
    isLoading: mutation.isPending,
    response: mutation.data ?? null,
    error:
      mutation.error instanceof Error
        ? mutation.error.message
        : mutation.error
          ? String(mutation.error)
          : null,
  };
}
