"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api-client";
import type { RestResponseData } from "@/hooks/use-rest-request";

export interface GraphqlRequestInput {
  query: string;
  variablesJson: string;
}

function buildHeaders(mfId: string | null): Headers {
  const h = new Headers({ "Content-Type": "application/json" });
  if (mfId) {
    h.set("X-MF-ID", mfId);
  }
  return h;
}

export async function sendGraphqlFetch(
  input: GraphqlRequestInput,
  mfId: string | null,
): Promise<RestResponseData> {
  const start = performance.now();
  const body: { query: string; variables?: unknown } = { query: input.query };
  const varsTrimmed = input.variablesJson.trim();
  if (varsTrimmed.length > 0) {
    body.variables = JSON.parse(varsTrimmed) as unknown;
  }

  const res = await fetch(`${API_BASE}/graphql`, {
    method: "POST",
    headers: buildHeaders(mfId),
    body: JSON.stringify(body),
  });

  const timeMs = Math.round(performance.now() - start);
  const text = await res.text();
  let parsedBody: unknown = text.length ? text : null;
  if (text.trim().length) {
    try {
      parsedBody = JSON.parse(text);
    } catch {
      parsedBody = text;
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
    body: parsedBody,
    headers,
  };
}

export function useGraphqlRequest(mfId: string | null) {
  const mutation = useMutation({
    mutationFn: (input: GraphqlRequestInput) => sendGraphqlFetch(input, mfId),
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
