"use client";

import { useState } from "react";
import { JsonView } from "@/components/playground/shared/JsonView";
import { StatusPill } from "@/components/playground/shared/StatusPill";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { API_BASE } from "@/lib/api-client";
import { SECTION_IDENTITY } from "./depth";

const DEMO_ENDPOINTS = [
  {
    id: "products",
    method: "GET" as const,
    path: "/api/products?limit=3",
    label: "Products",
    sample: {
      data: [
        { id: 1, title: "Wireless Mouse", price: 29.99, category: "electronics" },
        { id: 2, title: "USB-C Hub", price: 49.99, category: "accessories" },
        { id: 3, title: "Desk Lamp", price: 34.5, category: "home" },
      ],
      total: 142,
      limit: 3,
      skip: 0,
    },
  },
  {
    id: "users",
    method: "GET" as const,
    path: "/api/users?limit=3",
    label: "Users",
    sample: {
      data: [
        { id: 1, firstName: "Alex", lastName: "Dev", email: "alex@example.com" },
        { id: 2, firstName: "Sam", lastName: "Chen", email: "sam@example.com" },
        { id: 3, firstName: "Jordan", lastName: "Lee", email: "jordan@example.com" },
      ],
      total: 50,
      limit: 3,
      skip: 0,
    },
  },
  {
    id: "todos",
    method: "GET" as const,
    path: "/api/todos?limit=3",
    label: "Todos",
    sample: {
      data: [
        { id: 1, todo: "Wire up auth flow", completed: false, priority: "high" },
        { id: 2, todo: "Add pagination UI", completed: true, priority: "medium" },
        { id: 3, todo: "Test WebSocket feed", completed: false, priority: "low" },
      ],
      total: 30,
      limit: 3,
      skip: 0,
    },
  },
] as const;

type DemoEndpoint = (typeof DEMO_ENDPOINTS)[number];

type DemoState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; status: number; body: unknown }
  | { phase: "error"; message: string };

export function LiveDemo() {
  const containerRef = useRevealOnScroll([
    { selector: ".livedemo-eyebrow", stagger: 0 },
    { selector: ".livedemo-heading" },
    { selector: ".livedemo-sub" },
    { selector: ".livedemo-panel", triggerStart: "top 75%" },
  ]);

  const [activeEndpoint, setActiveEndpoint] = useState<DemoEndpoint>(DEMO_ENDPOINTS[0]);
  const [state, setState] = useState<DemoState>({ phase: "idle" });

  async function runRequest() {
    setState({ phase: "loading" });
    try {
      const res = await fetch(`${API_BASE}${activeEndpoint.path}`);
      const body = await res.json();
      setState({ phase: "success", status: res.status, body });
    } catch {
      setState({ phase: "error", message: "Failed to connect — is the mock server running?" });
    }
  }

  function selectEndpoint(endpoint: DemoEndpoint) {
    setActiveEndpoint(endpoint);
    setState({ phase: "idle" });
  }

  const isLoading = state.phase === "loading";

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className={`${SECTION_IDENTITY.liveDemo} px-6 py-28 sm:px-10 lg:px-16`}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p
            className="livedemo-eyebrow mb-3 font-mono text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            Live demo
          </p>
          <h2 className="livedemo-heading font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            Hit a live endpoint. See real JSON.
          </h2>
          <p className="livedemo-sub mt-4 text-base leading-relaxed text-[var(--color-text-muted)]">
            Pick a resource, run a GET — the response is what your production client would receive.
          </p>
        </div>

        <div
          className="livedemo-panel overflow-hidden rounded-xl border border-[var(--color-border)]"
          style={{ background: "var(--color-surface-raised)" }}
        >
          <div
            className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-5 py-3"
            style={{ background: "var(--color-surface)" }}
            role="tablist"
            aria-label="Demo endpoints"
          >
            {DEMO_ENDPOINTS.map((endpoint) => (
              <button
                key={endpoint.id}
                type="button"
                role="tab"
                aria-selected={activeEndpoint.id === endpoint.id}
                onClick={() => selectEndpoint(endpoint)}
                className="rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                style={{
                  color:
                    activeEndpoint.id === endpoint.id
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                  background:
                    activeEndpoint.id === endpoint.id
                      ? "var(--color-accent-glow)"
                      : "transparent",
                }}
              >
                {endpoint.label}
              </button>
            ))}
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-3 font-mono text-sm">
              <span
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{
                  background: "var(--color-accent-glow)",
                  color: "var(--color-accent)",
                }}
              >
                {activeEndpoint.method}
              </span>
              <span className="text-[var(--color-text-muted)]">{activeEndpoint.path}</span>
            </div>

            <button
              type="button"
              onClick={runRequest}
              disabled={isLoading}
              className="rounded-lg px-5 py-2 text-sm font-semibold transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
              }}
              aria-label={isLoading ? "Running request…" : "Run request"}
            >
              {isLoading ? "Running…" : "Run request"}
            </button>
          </div>

          <div className="p-5">
            {state.phase === "idle" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: "var(--color-surface)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Sample shape
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Illustrative — run the request for live data
                  </span>
                </div>
                <JsonView value={activeEndpoint.sample} maxHeightClassName="max-h-64" />
              </div>
            )}

            {state.phase === "loading" && (
              <div className="flex items-center justify-center gap-3 py-12">
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-accent)] motion-reduce:animate-none"
                  aria-hidden
                />
                <span className="text-sm text-[var(--color-text-muted)]">
                  Waiting for response…
                </span>
              </div>
            )}

            {state.phase === "success" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusPill httpStatus={state.status} />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Real response from mock API
                  </span>
                </div>
                <JsonView value={state.body} maxHeightClassName="max-h-72" />
              </div>
            )}

            {state.phase === "error" && (
              <p
                className="rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: "oklch(0.58 0.18 25 / 0.35)",
                  background: "oklch(0.58 0.18 25 / 0.08)",
                  color: "oklch(0.55 0.18 25)",
                }}
                role="alert"
              >
                {state.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
