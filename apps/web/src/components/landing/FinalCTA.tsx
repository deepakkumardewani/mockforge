"use client";

import Link from "next/link";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";

export function FinalCTA() {
  const containerRef = useRevealOnScroll({
    selector: ".finalcta-animate",
    from: { y: 24, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" },
    triggerStart: "top 85%",
  });

  return (
    <Section ref={containerRef} className="py-24 sm:py-28">
      <div
        className="finalcta-animate relative overflow-hidden rounded-2xl border border-[var(--color-border)] px-8 py-16 text-center sm:px-12 sm:py-20"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 100%, var(--color-accent), transparent)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl lg:text-5xl">
            Stop stubbing. Start shipping.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
            Your next feature deserves real-shaped data — open the playground and point your app at
            it today.
          </p>
          <div className="mt-10">
            <Link
              href="/playground"
              className="inline-flex rounded-lg px-8 py-3.5 text-base font-semibold transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
              }}
            >
              Open the Playground
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
