"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWsStats } from "@/hooks/use-ws-stats";

gsap.registerPlugin(ScrollTrigger);

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function LiveCounter() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const total = useWsStats();
  const prevTotal = useRef(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll(".counter-animate"),
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Full-bleed accent rule */}
      <div className="h-px w-full" style={{ background: "var(--color-accent)" }} />

      <div
        className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"
        style={{
          paddingTop: "clamp(3.5rem, 8vw, 6rem)",
          paddingBottom: "clamp(3.5rem, 8vw, 6rem)",
        }}
      >
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          {/* Counter — tight label→metric grouping, generous separation from meta */}
          <div className="counter-animate min-w-0 flex-1">
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Requests served
            </p>
            <h2 className="font-display text-[clamp(3.5rem,12vw,9rem)] font-black leading-none tabular-nums tracking-tight text-[var(--color-text-primary)]">
              <span ref={counterRef}>{total !== null ? formatNumber(total) : "—"}</span>
            </h2>
          </div>

          {/* Meta — aligned with reading edge on mobile; end-aligned on large screens */}
          <div className="counter-animate flex max-w-md flex-col gap-5 border-t border-[var(--color-border)] pt-10 lg:border-t-0 lg:pt-0 lg:text-right">
            <p className="text-pretty text-base leading-relaxed text-[var(--color-text-muted)] lg:ml-auto">
              Real data. Real developers. Growing every second.
            </p>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] lg:ml-auto">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: "var(--color-accent)" }}
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
              </span>
              Live via WebSocket
            </span>
          </div>
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "var(--color-border)" }} />
    </section>
  );
}
