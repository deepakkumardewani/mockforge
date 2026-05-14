"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Protocol {
  title: string;
  description: string;
  icon: React.ReactNode;
  sample: string;
}

const PROTOCOLS: Protocol[] = [
  {
    title: "REST",
    description:
      "Full CRUD across 14 entities. Pagination, search, sort — everything you expect from a production API.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
      </svg>
    ),
    sample: `GET /api/products
     ↓
{ "data": [...], "total": 142 }`,
  },
  {
    title: "GraphQL",
    description:
      "Query exactly what you need. Single endpoint, type-safe schema, interactive playground.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 8h10M7 12h6M7 16h8" />
      </svg>
    ),
    sample: `POST /graphql
       ↓
query { products { title price } }`,
  },
  {
    title: "WebSocket",
    description:
      "Real-time data streams for stats, notifications, chat, and stock tickers. Native Bun WebSocket.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M18 10l-4-4l-6 6l-4-4" />
        <path d="M14 4h4v4" />
        <path d="M6 20l4 4l6-6l4 4" />
        <path d="M10 20H6v-4" />
      </svg>
    ),
    sample: `ws://api/ws/notifications
         ↓
{ "type": "success", ... }`,
  },
  {
    title: "Socket.io",
    description:
      "Same real-time data, Socket.io flavor. Namespaces, rooms, auto-reconnect, fallback transport.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="2" r="2" />
        <circle cx="2" cy="6" r="2" />
        <circle cx="22" cy="6" r="2" />
        <circle cx="22" cy="18" r="2" />
        <circle cx="2" cy="18" r="2" />
        <circle cx="12" cy="22" r="2" />
      </svg>
    ),
    sample: `io("/notifications")
   .on("notification", ...)`,
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
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.12,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="section-heading mb-16 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            Four Protocols, One API
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Same data, your choice of transport. Mix and match as your app
            demands.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROTOCOLS.map((protocol, i) => (
            <div
              key={protocol.title}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 transition-all hover:border-[var(--color-accent)] hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                {protocol.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                {protocol.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {protocol.description}
              </p>
              <div className="rounded-lg bg-[var(--color-code-bg)] p-3">
                <pre className="whitespace-pre font-mono text-xs text-[var(--color-code-text)]">
                  {protocol.sample}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
