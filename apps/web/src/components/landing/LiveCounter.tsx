"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useWsStats } from "@/hooks/use-ws-stats";
import { useRevealOnScroll } from "./useRevealOnScroll";

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
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
    if (total !== null && total !== prevTotal.current && counterRef.current) {
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
    <section ref={containerRef} aria-labelledby="live-counter-label">
      <div className="h-px w-full" style={{ background: "var(--color-accent)" }} />

      <div
        className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"
        style={{
          paddingTop: "clamp(3.5rem, 7vw, 5.5rem)",
          paddingBottom: "clamp(3.5rem, 7vw, 5.5rem)",
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-end lg:gap-16">
          {/* Primary — metric */}
          <div className="counter-animate min-w-0">
            <p
              className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: "var(--color-accent)" }}
            >
              Live stats
            </p>
            <p
              id="live-counter-label"
              className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-muted)]"
            >
              Total requests
            </p>
            <p
              aria-busy={total === null}
              aria-live="polite"
              className="font-display text-[clamp(3.5rem,12vw,8.5rem)] font-black leading-none tabular-nums tracking-tight text-[var(--color-text-primary)]"
            >
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

          {/* Secondary — context */}
          <div className="counter-animate flex flex-col gap-5 border-t border-[var(--color-border)] pt-8 lg:border-t-0 lg:pt-0 lg:pb-2">
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
              Cumulative count of requests handled by the mock API. Updates arrive over the stats
              WebSocket as new traffic comes in.
            </p>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-[var(--color-text-muted)]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none"
                  style={{ background: "var(--color-accent)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
              </span>
              WebSocket · live
            </span>
          </div>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "var(--color-border)" }} />
    </section>
  );
}
