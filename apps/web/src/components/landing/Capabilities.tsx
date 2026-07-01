"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

interface Capability {
  title: string;
  description: string;
}

const CAPABILITIES: Capability[] = [
  {
    title: "One schema, four protocols",
    description:
      "REST, GraphQL, WebSocket, and Socket.io share the same typed resources — swap wire formats without rethinking your data model.",
  },
  {
    title: "Real-time channels",
    description:
      "Push streams for notifications, chat, and ticker data over native WebSocket and Socket.io with rooms and namespaces.",
  },
  {
    title: "Pagination, search, sort",
    description:
      "Every REST resource supports limit/skip pagination, text search, and sort — the query shape you'd expect from production.",
  },
  {
    title: "Cross-protocol stats",
    description:
      "Unified request counting across all four protocols — the live counter on this page is real, Redis-backed telemetry.",
  },
  {
    title: "Zero auth",
    description:
      "Signup-free, keyless access. Point your client at the hosted mock server and start querying immediately.",
  },
  {
    title: "Hosted Playground + Builder",
    description:
      "Explore every endpoint in the browser Playground or define custom schemas in the Builder — both live on this site.",
  },
];

export function Capabilities() {
  const containerRef = useRevealOnScroll([
    {
      selector: ".section-heading",
      from: { clipPath: "inset(0 100% 0 0)", y: 6 },
      to: { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.8, ease: "power3.out" },
    },
    {
      selector: ".capability-card",
      from: { y: 32, opacity: 0 },
      to: { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
      stagger: 0.08,
      triggerStart: "top 82%",
    },
  ]);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.capabilities}>
      <div className="section-heading mb-14 overflow-hidden sm:mb-16">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Capabilities
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Built for real dev workflows
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Ship-ready today — every capability below is live in the Playground, not on a roadmap.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((cap) => (
          <div
            key={cap.title}
            className="capability-card rounded-xl border border-[var(--color-border)] p-6 transition-[border-color,background-color] duration-200 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-raised)]"
            style={{ background: "var(--color-surface)" }}
          >
            <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
              {cap.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {cap.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
