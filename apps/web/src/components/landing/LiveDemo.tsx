"use client";

import { useState } from "react";
import { JsonView } from "@/components/playground/shared/JsonView";
import { StatusPill } from "@/components/playground/shared/StatusPill";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { API_BASE } from "@/lib/api-client";

const DEMO_ENDPOINT = "GET /api/products?limit=3";
const DEMO_FETCH_URL = `${API_BASE}/api/products?limit=3`;

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

  const [state, setState] = useState<DemoState>({ phase: "idle" });

  async function runRequest() {
    setState({ phase: "loading" });
    try {
      const res = await fetch(DEMO_FETCH_URL);
      const body = await res.json();
      setState({ phase: "success", status: res.status, body });
    } catch {
      setState({ phase: "error", message: "Failed to connect — is the mock server running?" });
    }
  }

  const isLoading = state.phase === "loading";

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="px-6 py-28 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p
            className="livedemo-eyebrow mb-3 font-mono text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            Live demo
          </p>
          <h2 className="livedemo-heading font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            See it work, right now.
          </h2>
          <p className="livedemo-sub mt-4 text-base leading-relaxed text-[var(--color-text-muted)]">
            Fire a real request against the running mock API. No setup, no tokens — watch the JSON
            land.
          </p>
        </div>

        {/* Request + response panel */}
        <div
          className="livedemo-panel overflow-hidden rounded-xl border border-[var(--color-border)]"
          style={{ background: "var(--color-surface-raised)" }}
        >
          {/* Request bar */}
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
                GET
              </span>
              <span className="text-[var(--color-text-muted)]">{DEMO_ENDPOINT.slice(4)}</span>
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

          {/* Response area */}
          <div className="p-5">
            {state.phase === "idle" && (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                Hit{" "}
                <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
                  Run request
                </span>{" "}
                to fire the live API call.
              </p>
            )}

            {state.phase === "loading" && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-accent)]"
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
