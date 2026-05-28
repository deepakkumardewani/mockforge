"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWsStats } from "@/hooks/use-ws-stats";
import { useRevealOnScroll } from "./useRevealOnScroll";

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

export function LiveCounter() {
  const containerRef = useRevealOnScroll({
    selector: ".counter-animate",
    stagger: 0.1,
    to: { duration: 0.75, ease: "power3.out" },
    triggerStart: "top 85%",
  });
  const counterRef = useRef<HTMLSpanElement>(null);
  const total = useWsStats();
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
    <section ref={containerRef} aria-labelledby="live-counter-heading">
      <div className="h-px w-full" style={{ background: "var(--color-accent)" }} />

      <div
        className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"
        style={{
          paddingTop: "clamp(3.5rem, 7vw, 5.5rem)",
          paddingBottom: "clamp(3.5rem, 7vw, 5.5rem)",
        }}
      >
        <div className="counter-animate min-w-0">
          <p
            id="live-counter-heading"
            className="mb-6 inline-flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            <LivePulse />
            Live stats
          </p>
          <p
            aria-busy={total === null}
            aria-live="polite"
            className="font-display text-[clamp(3.5rem,12vw,8.5rem)] font-black leading-none tabular-nums tracking-tight text-[var(--color-text-primary)]"
          >
            <span className="sr-only">Total API requests served: </span>
            {total !== null ? (
              <span ref={counterRef}>{formatNumber(total)}</span>
            ) : (
              <span
                aria-hidden
                className="inline-block animate-pulse rounded-md bg-[var(--color-border)]"
                style={{
                  width: "clamp(9rem, 36vw, 16rem)",
                  height: "clamp(3.5rem, 12vw, 8.5rem)",
                }}
              />
            )}
          </p>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "var(--color-border)" }} />
    </section>
  );
}
