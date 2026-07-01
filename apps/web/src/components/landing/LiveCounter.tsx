"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { SECTION_IDENTITY } from "./depth";

type LiveCounterProps = {
  initialTotal?: number | null;
};

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none"
        style={{ background: "var(--color-accent)" }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: "var(--color-accent)" }}
      />
    </span>
  );
}

export function LiveCounter({ initialTotal = null }: LiveCounterProps) {
  const containerRef = useRevealOnScroll({
    selector: ".counter-animate",
    stagger: 0.1,
    to: { duration: 0.75, ease: "power3.out" },
    triggerStart: "top 85%",
  });
  const counterRef = useRef<HTMLSpanElement>(null);
  const total = initialTotal;
  const prevTotal = useRef(0);

  useEffect(() => {
    if (total === null || total === prevTotal.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      if (counterRef.current) {
        counterRef.current.textContent = formatNumber(total);
      }
      prevTotal.current = total;
      return;
    }

    if (counterRef.current) {
      counterRef.current.classList.remove("landing-counter-tick");
      // Force reflow so re-adding the class retriggers the animation
      void counterRef.current.offsetWidth;
      counterRef.current.classList.add("landing-counter-tick");
      gsap.fromTo(
        counterRef.current,
        { textContent: prevTotal.current },
        {
          textContent: total,
          duration: 0.6,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            const val = Math.round(gsap.getProperty(counterRef.current, "textContent") as number);
            if (counterRef.current) {
              counterRef.current.textContent = formatNumber(val);
            }
          },
        },
      );
      prevTotal.current = total;
    }
  }, [total]);

  return (
    <section
      ref={containerRef}
      aria-labelledby="live-counter-heading"
      className={SECTION_IDENTITY.liveCounter}
    >
      <div className="h-px w-full" style={{ background: "var(--color-accent)" }} />

      <div
        className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"
        style={{
          paddingTop: "clamp(4rem, 9vw, 7rem)",
          paddingBottom: "clamp(4rem, 9vw, 7rem)",
        }}
      >
        <div className="counter-animate grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="min-w-0">
            <p
              id="live-counter-heading"
              className="mb-6 inline-flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: "var(--color-accent)" }}
            >
              <LivePulse />
              Requests served
            </p>
            <p
              aria-busy={total === null}
              aria-live="polite"
              className="font-display text-[clamp(4rem,14vw,10rem)] font-black leading-[0.9] tabular-nums tracking-tight text-[var(--color-text-primary)]"
            >
              <span className="sr-only">Total API requests served: </span>
              {total !== null ? (
                <span ref={counterRef}>{formatNumber(total)}</span>
              ) : (
                <span
                  aria-hidden
                  className="inline-block animate-pulse rounded-md bg-[var(--color-border)] motion-reduce:animate-none"
                  style={{
                    width: "clamp(10rem, 40vw, 18rem)",
                    height: "clamp(4rem, 14vw, 10rem)",
                  }}
                />
              )}
            </p>
          </div>

          <div className="max-w-md lg:pb-4">
            <p className="text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
              A running total of every request the mock server has handled so far.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "var(--color-border)" }} />
    </section>
  );
}
