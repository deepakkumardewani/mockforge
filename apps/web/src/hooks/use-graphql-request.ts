"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api-client";
import { MF_ID_HEADER } from "@/lib/playground-constants";
import { timedFetch, type HttpResponseData } from "@/components/playground/hooks/timed-fetch";

export const PLAYGROUND_GRAPHQL_URL = `${API_BASE}/graphql`;

export interface GraphqlRequestInput {
  query: string;
  variablesJson: string;
}

function buildHeaders(mfId: string | null): Headers {
  const h = new Headers({ "Content-Type": "application/json" });
  if (mfId) {
    h.set(MF_ID_HEADER, mfId);
  }
  return h;
}

export async function sendGraphqlFetch(
  input: GraphqlRequestInput,
  mfId: string | null,
): Promise<HttpResponseData> {
  const body: { query: string; variables?: unknown } = { query: input.query };
  const varsTrimmed = input.variablesJson.trim();
  if (varsTrimmed.length > 0) {
    body.variables = JSON.parse(varsTrimmed) as unknown;
  }

  return timedFetch(PLAYGROUND_GRAPHQL_URL, {
    method: "POST",
    headers: buildHeaders(mfId),
    body: JSON.stringify(body),
  });
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
