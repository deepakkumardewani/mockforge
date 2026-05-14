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
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
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
    <section ref={sectionRef} className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow),transparent_70%)]" />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="counter-animate text-lg text-[var(--color-text-muted)]">
          Trusted by developers worldwide
        </p>
        <h2 className="counter-animate mt-2 text-5xl font-bold tabular-nums tracking-tight sm:text-7xl">
          <span ref={counterRef} className="text-[var(--color-accent)]">
            {total !== null ? formatNumber(total) : "—"}
          </span>
        </h2>
        <p className="counter-animate mt-4 text-xl text-[var(--color-text-muted)]">
          API requests served and counting
        </p>
        <p className="counter-animate mt-6 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          Live via WebSocket
        </p>
      </div>
    </section>
  );
}
