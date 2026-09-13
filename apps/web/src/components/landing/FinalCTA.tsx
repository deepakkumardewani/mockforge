"use client";

import Link from "next/link";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

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
        className="finalcta-animate flex flex-col items-start justify-between gap-8 overflow-hidden rounded-xl border border-[var(--color-border)] px-8 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="max-w-xl">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-[var(--color-text-primary)]">
            Point your app at the hosted API
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)]">
            No account and no API key. Docs cover the contract for each resource and protocol.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="landing-btn-primary inline-flex rounded-lg px-8 py-3.5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-on-accent)",
            }}
          >
            Read the Docs
          </Link>
          <Link
            href="/playground"
            className="landing-btn-secondary inline-flex rounded-lg border border-[var(--color-border)] px-8 py-3.5 text-base font-medium text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            style={{ background: "var(--color-surface)" }}
          >
            Explore in Playground
          </Link>
        </div>
      </div>
    </Section>
  );
}
