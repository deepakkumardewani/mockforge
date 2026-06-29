"use client";

import Link from "next/link";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";
import { API_BASE } from "@/lib/api-client";

const STEPS = [
  {
    step: "01",
    title: "Open the Playground",
    detail: "Browse every resource and protocol in the browser — no install step.",
  },
  {
    step: "02",
    title: "Point your client",
    detail: `Set your base URL to the hosted mock server and start fetching.`,
  },
  {
    step: "03",
    title: "Query live data",
    detail: "Hit REST, GraphQL, or connect a WebSocket — all from the same schema.",
  },
] as const;

export function Quickstart() {
  const containerRef = useRevealOnScroll([
    { selector: ".quickstart-animate", stagger: 0.12, triggerStart: "top 82%" },
  ]);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.quickstart}>
      <div className="quickstart-animate mb-12 max-w-2xl">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Quickstart
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Start in the Playground in seconds
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          MockForge is web-native — no CLI, no package install. Open the Playground and point your
          client at the live API.
        </p>
      </div>

      <div className="quickstart-animate grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
        <ol className="space-y-6">
          {STEPS.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span
                className="mt-0.5 shrink-0 font-mono text-sm font-bold tabular-nums"
                style={{ color: "var(--color-accent)" }}
              >
                {item.step}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div
          className="overflow-hidden rounded-xl border border-[var(--color-border)]"
          style={{ background: "var(--color-code-bg)" }}
        >
          <div
            className="border-b border-[var(--color-border)] px-5 py-3 font-mono text-xs text-[var(--color-text-muted)]"
            style={{ background: "var(--color-surface-raised)" }}
          >
            Base URL
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-[var(--color-code-text)]">
            <code>{API_BASE}</code>
          </pre>
          <div className="border-t border-[var(--color-border)] px-5 py-4">
            <Link
              href="/playground"
              className="inline-flex rounded-lg px-6 py-2.5 text-sm font-semibold transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
              }}
            >
              Open Playground
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
