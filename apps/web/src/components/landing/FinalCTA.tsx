"use client";

import Link from "next/link";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

const PROOF_POINTS = [
  "Hosted Playground + Builder",
  "Real-time WebSocket feeds",
  "One schema, four protocols",
] as const;

export function FinalCTA() {
  const containerRef = useRevealOnScroll({
    selector: ".finalcta-animate",
    from: { y: 24, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" },
    triggerStart: "top 85%",
  });

  return (
    <Section ref={containerRef} className={`${SECTION_IDENTITY.finalCta} py-20 sm:py-24`}>
      <div
        className="finalcta-animate grid gap-8 overflow-hidden rounded-xl border border-[var(--color-border)] lg:grid-cols-[1.2fr_1fr] lg:gap-0"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="flex flex-col justify-center px-8 py-10 sm:px-10 sm:py-12">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-[var(--color-text-primary)]">
            Stop stubbing. Start shipping.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--color-text-muted)]">
            Fixtures drift. Typed endpoints stay in sync with your schema — no install step, no
            hand-maintained stubs.
          </p>
          <div className="mt-8">
            <Link
              href="/playground"
              className="landing-btn-primary inline-flex rounded-lg px-8 py-3.5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
              }}
            >
              Open the Playground
            </Link>
          </div>
        </div>

        <div
          className="flex flex-col justify-center border-t border-[var(--color-border)] px-8 py-8 lg:border-t-0 lg:border-l lg:px-10"
          style={{ background: "var(--color-surface)" }}
        >
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            What you get
          </p>
          <ul className="space-y-3">
            {PROOF_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
                  style={{
                    background: "var(--color-accent-glow)",
                    color: "var(--color-accent)",
                  }}
                  aria-hidden
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
