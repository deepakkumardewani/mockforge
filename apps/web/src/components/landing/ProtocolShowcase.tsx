"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";
import { API_BASE } from "@/lib/api-client";
import { getSocketIoBaseUrl } from "@/lib/playground-env";

function toWsOrigin(httpBase: string): string {
  try {
    const url = new URL(httpBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.origin;
  } catch {
    return httpBase.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
  }
}

type ProtocolId = "REST" | "GraphQL" | "WebSocket" | "Socket.io";

const PROTOCOL_DOCS: Record<ProtocolId, string> = {
  REST: "/docs/rest",
  GraphQL: "/docs/graphql",
  WebSocket: "/docs/websockets",
  "Socket.io": "/docs/socketio",
};

function buildProtocols(apiBase: string, socketIoBase: string) {
  const wsOrigin = toWsOrigin(apiBase);
  return [
    {
      id: "REST" as const,
      tag: "HTTP",
      summary: "List products with limit/skip pagination, search, and sort.",
      sample: `GET ${apiBase}/api/products?limit=5&sort=price
→ { "data": [...], "total": 50, "limit": 5, "skip": 0 }`,
    },
    {
      id: "GraphQL" as const,
      tag: "/graphql",
      summary: "Select the same Product fields in one operation.",
      sample: `POST ${apiBase}/graphql
query { products(limit: 5) { title price category } }
→ { "data": { "products": [...] } }`,
    },
    {
      id: "WebSocket" as const,
      tag: "ws",
      summary: "Subscribe to a push channel on the same hosted origin.",
      sample: `GET ${wsOrigin}/ws/notifications
→ { "type": "notification", "title": "...", "read": false }`,
    },
    {
      id: "Socket.io" as const,
      tag: "events",
      summary: "Same notification stream with Socket.io rooms and namespaces.",
      sample: `io("${socketIoBase}/notifications")
  .on("notification", handler)`,
    },
  ];
}

export function ProtocolShowcase() {
  const containerRef = useRevealOnScroll([
    {
      selector: ".section-heading",
      from: { clipPath: "inset(0 100% 0 0)", y: 6 },
      to: { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.8, ease: "power3.out" },
      triggerStart: "top 80%",
    },
    {
      selector: ".protocol-card",
      from: { y: 48, opacity: 0 },
      to: { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" },
      stagger: 0.1,
      triggerStart: "top 80%",
    },
  ]);

  const protocols = useMemo(() => buildProtocols(API_BASE, getSocketIoBaseUrl()), []);
  const [activeId, setActiveId] = useState<ProtocolId>("REST");
  const active = protocols.find((protocol) => protocol.id === activeId) ?? protocols[0];

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.protocols}>
      <div className="section-heading mb-12 overflow-hidden sm:mb-16">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Protocols
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          One Product resource, four wire formats
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Switch transports without remapping fields. REST, GraphQL, WebSocket, and Socket.io expose
          the same typed Product resource on one hosted origin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10">
        <div className="protocol-card flex flex-col gap-1" role="tablist" aria-label="Wire formats">
          {protocols.map((protocol) => (
            <button
              key={protocol.id}
              type="button"
              role="tab"
              id={`protocol-tab-${protocol.id}`}
              aria-selected={protocol.id === activeId}
              aria-controls="protocol-sample-panel"
              onClick={() => setActiveId(protocol.id)}
              className="landing-tab rounded-lg border px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{
                borderColor:
                  protocol.id === activeId ? "var(--color-accent)" : "var(--color-border)",
                background:
                  protocol.id === activeId ? "var(--color-surface-raised)" : "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <span className="block font-display text-sm font-bold">{protocol.id}</span>
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {protocol.tag}
              </span>
            </button>
          ))}
        </div>

        <div
          id="protocol-sample-panel"
          role="tabpanel"
          aria-labelledby={`protocol-tab-${active.id}`}
          className="protocol-card rounded-xl border border-[var(--color-border)] p-6 sm:p-8"
          style={{ background: "var(--color-surface-raised)" }}
        >
          <p className="max-w-lg text-sm leading-relaxed text-[var(--color-text-muted)]">
            {active.summary}
          </p>
          <pre
            className="mt-6 overflow-x-auto rounded-lg p-4 font-mono text-xs leading-relaxed text-[var(--color-code-text)] sm:text-sm"
            style={{ background: "var(--color-code-bg)" }}
          >
            <code>{active.sample}</code>
          </pre>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={PROTOCOL_DOCS[active.id]}
              className="inline-flex text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{ color: "var(--color-accent)" }}
            >
              Read {active.id} docs
            </Link>
            <Link
              href="/playground"
              className="inline-flex text-sm font-medium text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Explore in Playground
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
