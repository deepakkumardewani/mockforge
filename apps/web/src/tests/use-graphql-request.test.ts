import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api-client";
import { MF_ID_HEADER } from "@/lib/playground-constants";
import {
  PLAYGROUND_GRAPHQL_URL,
  sendGraphqlFetch,
  useGraphqlRequest,
} from "@/hooks/use-graphql-request";

function jsonResponse(body: unknown) {
  return {
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe("sendGraphqlFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts to the playground GraphQL URL with only a query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { ping: true } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendGraphqlFetch({ query: "{ ping }", variablesJson: "  " }, null);

    expect(PLAYGROUND_GRAPHQL_URL).toBe(`${API_BASE}/graphql`);
    expect(fetchMock).toHaveBeenCalledWith(
      PLAYGROUND_GRAPHQL_URL,
      expect.objectContaining({ method: "POST" }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({ query: "{ ping }" });
    expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
    expect((init.headers as Headers).has(MF_ID_HEADER)).toBe(false);
    expect(result.body).toEqual({ data: { ping: true } });
  });

  it("parses variables JSON and attaches X-MF-ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: {} }));
    vi.stubGlobal("fetch", fetchMock);

    await sendGraphqlFetch(
      { query: "query User($id: ID!) { user(id: $id) { id } }", variablesJson: '{"id":"u1"}' },
      "mf-gql",
    );

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      query: "query User($id: ID!) { user(id: $id) { id } }",
      variables: { id: "u1" },
    });
    expect((init.headers as Headers).get(MF_ID_HEADER)).toBe("mf-gql");
  });

  it("throws when variables JSON is invalid", async () => {
    await expect(
      sendGraphqlFetch({ query: "{ ping }", variablesJson: "{not-json" }, null),
    ).rejects.toThrow(SyntaxError);
  });
});

describe("useGraphqlRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns idle values before a request is sent", () => {
    const { result } = renderHook(() => useGraphqlRequest(null), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("stores the response after a successful send", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: { ping: true } })));

    const { result } = renderHook(() => useGraphqlRequest("mf-1"), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.send({ query: "{ ping }", variablesJson: "" });
    });

    await waitFor(() => {
      expect(result.current.response?.body).toEqual({ data: { ping: true } });
    });
    expect(result.current.error).toBeNull();
  });

  it("surfaces an Error message when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("GraphQL down")));

    const { result } = renderHook(() => useGraphqlRequest(null), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.send({ query: "{ ping }", variablesJson: "" }).catch(() => undefined);
    });

    await waitFor(() => {
      expect(result.current.error).toBe("GraphQL down");
    });
  });

  it("stringifies a non-Error rejection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(404));

    const { result } = renderHook(() => useGraphqlRequest(null), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.send({ query: "{ ping }", variablesJson: "" }).catch(() => undefined);
    });

    await waitFor(() => {
      expect(result.current.error).toBe("404");
    });
  });
});
