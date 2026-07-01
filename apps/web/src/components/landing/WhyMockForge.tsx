"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

interface Strength {
  title: string;
  detail: string;
}

const STRENGTHS: Strength[] = [
  {
    title: "Multi-protocol from one schema",
    detail:
      "Four wire formats backed by the same 15 typed resources — no duplicate fixtures per protocol.",
  },
  {
    title: "Hosted live playground",
    detail:
      "Try every endpoint in the browser without installing anything or spinning up a local server first.",
  },
  {
    title: "Real-time out of the box",
    detail:
      "WebSocket and Socket.io channels for stats, notifications, chat, and ticker — not bolted on later.",
  },
  {
    title: "Frictionless start",
    detail: "No accounts, no config files. Change the base URL in your client and you're mocking.",
  },
];

export function WhyMockForge() {
  const containerRef = useRevealOnScroll([
    { selector: ".why-animate", stagger: 0.1, triggerStart: "top 82%" },
  ]);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.whyMockForge}>
      <div className="why-animate mb-12 max-w-2xl">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Why MockForge
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          One mock server, every protocol
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          MockForge is built around a single typed schema that speaks REST, GraphQL, WebSocket, and
          Socket.io — so your frontend never outgrows its mock layer.
        </p>
      </div>

      <div
        className="why-animate grid gap-px overflow-hidden rounded-xl border border-[var(--color-border)] sm:grid-cols-2"
        style={{ background: "var(--color-border)" }}
      >
        {STRENGTHS.map((item, i) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 p-8"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <span
              className="font-mono text-xs font-bold tabular-nums"
              style={{ color: "var(--color-accent)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{item.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
