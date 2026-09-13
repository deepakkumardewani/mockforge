import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api-client";
import { MF_ID_HEADER } from "@/lib/playground-constants";
import {
  resolveRestUrl,
  sendRestFetch,
  useRestRequest,
  type RestRequestInput,
} from "@/hooks/use-rest-request";

function jsonResponse(body: unknown, status = 200, statusText = "OK") {
  return {
    status,
    statusText,
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

describe("resolveRestUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("leaves absolute http and https URLs unchanged", () => {
    expect(resolveRestUrl("http://example.com/api/users")).toBe("http://example.com/api/users");
    expect(resolveRestUrl("https://example.com/api/users")).toBe("https://example.com/api/users");
  });

  it("prefixes a leading-slash path with API_BASE", () => {
    expect(resolveRestUrl("/api/users")).toBe(`${API_BASE}/api/users`);
  });

  it("adds a slash when the path has no leading slash", () => {
    expect(resolveRestUrl("api/users")).toBe(`${API_BASE}/api/users`);
  });
});

describe("sendRestFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("omits the body for GET even when a body string is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await sendRestFetch(
      { method: "GET", url: "/api/users", headers: {}, body: '{"unused":true}' },
      null,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}/api/users`,
      expect.objectContaining({ method: "GET", body: undefined }),
    );
  });

  it("adds Content-Type for a POST body when it is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendRestFetch(
      {
        method: "POST",
        url: "/api/users",
        headers: { Accept: "application/json" },
        body: '{"name":"Ada"}',
      },
      "mf-user-1",
    );

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get(MF_ID_HEADER)).toBe("mf-user-1");
    expect(init.body).toBe('{"name":"Ada"}');
  });

  it("does not overwrite an existing content-type header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await sendRestFetch(
      {
        method: "PUT",
        url: "https://api.example.com/items/1",
        headers: { "content-type": "text/plain" },
        body: "plain",
      },
      null,
    );

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("content-type")).toBe("text/plain");
  });

  it("skips blank header names and omits X-MF-ID when mfId is null", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null));
    vi.stubGlobal("fetch", fetchMock);

    await sendRestFetch(
      { method: "DELETE", url: "/api/users/1", headers: { "": "x", "X-Trace": "1" } },
      null,
    );

    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("X-Trace")).toBe("1");
    expect(headers.has(MF_ID_HEADER)).toBe(false);
  });
});

describe("useRestRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns idle values before a request is sent", () => {
    const { result } = renderHook(() => useRestRequest(null), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("stores the timed response after a successful send", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ users: [] })));

    const { result } = renderHook(() => useRestRequest("mf-1"), { wrapper: createWrapper() });
    const input: RestRequestInput = { method: "GET", url: "/api/users", headers: {} };

    await act(async () => {
      await result.current.send(input);
    });

    await waitFor(() => {
      expect(result.current.response?.status).toBe(200);
    });
    expect(result.current.response?.body).toEqual({ users: [] });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("surfaces an Error message when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network down")));

    const { result } = renderHook(() => useRestRequest(null), { wrapper: createWrapper() });

    await act(async () => {
      await result.current
        .send({ method: "GET", url: "/api/users", headers: {} })
        .catch(() => undefined);
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Network down");
    });
    expect(result.current.response).toBeNull();
  });

  it("stringifies a non-Error rejection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("boom"));

    const { result } = renderHook(() => useRestRequest(null), { wrapper: createWrapper() });

    await act(async () => {
      await result.current
        .send({ method: "GET", url: "/api/users", headers: {} })
        .catch(() => undefined);
    });

    await waitFor(() => {
      expect(result.current.error).toBe("boom");
    });
  });
});
