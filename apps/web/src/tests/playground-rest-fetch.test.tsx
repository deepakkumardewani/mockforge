import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResponseViewer } from "@/components/playground/rest/ResponseViewer";
import { useRestRequest } from "@/hooks/use-rest-request";

function makeQueryWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("Playground REST — ResponseViewer", () => {
  it("shows empty guidance when no response", () => {
    render(<ResponseViewer response={null} />);
    expect(screen.getByText("Send a request to see the response")).toBeInTheDocument();
  });

  it("renders HTTP 200 and JSON body", () => {
    render(
      <ResponseViewer
        response={{
          status: 200,
          statusText: "OK",
          timeMs: 12,
          body: { ping: true },
          headers: { "content-type": "application/json" },
        }}
      />,
    );
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText(/ping/u)).toBeInTheDocument();
  });

  it("renders 404 error payload in the body", () => {
    render(
      <ResponseViewer
        response={{
          status: 404,
          statusText: "Not Found",
          timeMs: 33,
          body: { error: "Not found resource" },
          headers: {},
        }}
      />,
    );
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/Not found resource/u)).toBeInTheDocument();
  });
});

describe("Playground REST — useRestRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("resolves mutation with parsed JSON for HTTP 404", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "absent" }), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { result } = renderHook(() => useRestRequest(null), {
      wrapper: makeQueryWrapper(),
    });

    await act(async () => {
      await result.current.send({
        method: "GET",
        url: "/api/missing",
        headers: {},
      });
    });

    await waitFor(() => {
      expect(result.current.response?.status).toBe(404);
    });
    expect(result.current.response?.body).toEqual({ message: "absent" });
    expect(result.current.error).toBeNull();
  });

  it("returns status and body on HTTP 200", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: 1 }]), {
        status: 200,
        statusText: "OK",
      }),
    );

    const { result } = renderHook(() => useRestRequest(null), {
      wrapper: makeQueryWrapper(),
    });

    await act(async () => {
      await result.current.send({
        method: "GET",
        url: "/api/users",
        headers: {},
      });
    });

    await waitFor(() => {
      expect(result.current.response?.status).toBe(200);
    });
    expect(result.current.response?.body).toEqual([{ id: 1 }]);
  });
});
