"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
      "Full CRUD across 14 entities. Pagination, search, and sort — everything you expect from a production API.",
    sample: `GET /api/products?limit=5&sort=price
→ { "data": [...], "total": 142 }`,
  },
  {
    title: "GraphQL",
    abbr: "GQL",
    tag: "Single endpoint",
    description:
      "Query exactly what you need. Type-safe schema, interactive playground, no over-fetching.",
    sample: `query { products { title price } }
→ { "products": [...] }`,
  },
  {
    title: "WebSocket",
    abbr: "WS",
    tag: "Real-time",
    description:
      "Live data streams for stats, notifications, chat, and stock tickers. Native Bun WebSocket.",
    sample: `ws://api/ws/notifications
→ { "type": "success", ... }`,
  },
  {
    title: "Socket.io",
    abbr: "SIO",
    tag: "Event-driven",
    description:
      "Same real-time data with Socket.io flavour. Namespaces, rooms, auto-reconnect built in.",
    sample: `io("/notifications").on("notification", fn)
→ streaming events`,
  },
];

export function ProtocolShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current.querySelector(".section-heading"),
        { clipPath: "inset(0 100% 0 0)", y: 6 },
        {
          clipPath: "inset(0 0% 0 0)",
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        },
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%" },
            delay: i * 0.1,
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="section-heading mb-16 overflow-hidden">
          <span
            className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            Protocols
          </span>
          <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
            Four transports, one API
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            Same data, your choice of transport. Mix and match as your app demands.
          </p>
        </div>

        {/* 2×2 bento grid */}
        <div className="grid gap-px rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] overflow-hidden sm:grid-cols-2">
          {PROTOCOLS.map((protocol, i) => (
            <div
              key={protocol.title}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="group relative overflow-hidden bg-[var(--color-surface)] p-8 transition-colors duration-300 hover:bg-[var(--color-surface-raised)]"
            >
              {/* Oversized background abbr */}
              <span
                className="pointer-events-none absolute -right-4 -bottom-6 select-none font-display text-8xl font-black tracking-tighter opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.07]"
                style={{ color: "var(--color-accent)" }}
                aria-hidden
              >
                {protocol.abbr}
              </span>

              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                    {protocol.title}
                  </h3>
                  <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
                    {protocol.tag}
                  </span>
                </div>

                <p className="mb-6 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {protocol.description}
                </p>

                <div className="rounded-lg p-4" style={{ background: "var(--color-code-bg)" }}>
                  <pre className="font-mono text-xs leading-relaxed text-[var(--color-code-text)]">
                    {protocol.sample}
                  </pre>
                </div>
              </div>

              {/* Accent edge on hover — full bottom border, not a stripe */}
              <div
                className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"
                style={{ background: "var(--color-accent)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
