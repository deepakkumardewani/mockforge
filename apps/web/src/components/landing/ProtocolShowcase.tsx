"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

interface Protocol {
  title: string;
  abbr: string;
  description: string;
  sample: string;
  tag: string;
}

const PROTOCOLS: Protocol[] = [
  {
    title: "REST",
    abbr: "REST",
    tag: "HTTP/1.1",
    description:
      "Pagination (limit/skip), search, and sort on every resource. The shape you'd expect from a production backend.",
    sample: `GET /api/products?limit=5&sort=price
→ { "data": [...], "total": 142 }`,
  },
  {
    title: "GraphQL",
    abbr: "GQL",
    tag: "Single endpoint",
    description:
      "One schema, precise queries. Fetch nested relations without chaining five REST calls.",
    sample: `query { products { title price } }
→ { "products": [...] }`,
  },
  {
    title: "WebSocket",
    abbr: "WS",
    tag: "Real-time",
    description:
      "Push channels for stats, notifications, chat, and tickers — native Bun WebSocket under the hood.",
    sample: `ws://api/ws/notifications
→ { "type": "success", ... }`,
  },
  {
    title: "Socket.io",
    abbr: "SIO",
    tag: "Event-driven",
    description:
      "Same live streams with rooms, namespaces, and reconnect semantics your Socket.io client already expects.",
    sample: `io("/notifications").on("notification", fn)
→ streaming events`,
  },
];

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

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.protocols}>
      <div className="section-heading mb-16 overflow-hidden">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Protocols
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Pick your wire format
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Same typed resources across four wire formats — use the transport your stack already speaks.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
        {PROTOCOLS.map((protocol) => (
          <div
            key={protocol.title}
            className="protocol-card group relative overflow-hidden bg-[var(--color-surface)] p-8 transition-[background-color,box-shadow] duration-300 hover:bg-[var(--color-surface-raised)] hover:shadow-[inset_0_0_0_1px_var(--color-border)] active:scale-[0.995] motion-reduce:active:scale-100"
          >
            <span
              className="pointer-events-none absolute -right-4 -bottom-6 select-none font-display text-8xl font-black tracking-tighter opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
              style={{ color: "var(--color-accent)" }}
              aria-hidden
            >
              {protocol.abbr}
            </span>

            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-4 flex items-center gap-3">
                <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                  {protocol.title}
                </h3>
                <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-muted)] transition-colors duration-300 group-hover:border-[var(--color-accent)]/30 group-hover:text-[var(--color-text-primary)]">
                  {protocol.tag}
                </span>
              </div>

              <p className="mb-6 max-w-sm flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {protocol.description}
              </p>

              <div
                className="rounded-lg border border-transparent p-4 transition-[border-color,background-color] duration-300 group-hover:border-[var(--color-border)]"
                style={{ background: "var(--color-code-bg)" }}
              >
                <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Sample
                </p>
                <pre className="font-mono text-xs leading-relaxed text-[var(--color-code-text)]">
                  {protocol.sample}
                </pre>
              </div>
            </div>

            <div
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
              style={{ background: "var(--color-accent)" }}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
