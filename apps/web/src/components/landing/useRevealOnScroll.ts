import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface RevealTarget {
  selector: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  triggerStart?: string;
  stagger?: number;
}

const DEFAULT_FROM: gsap.TweenVars = { y: 32, opacity: 0 };
const DEFAULT_TO: gsap.TweenVars = { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" };

export function useRevealOnScroll(
  targets: RevealTarget | RevealTarget[],
): RefObject<HTMLElement | null> {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const list = Array.isArray(targets) ? targets : [targets];
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;
      for (const target of list) {
        const elements = containerRef.current.querySelectorAll(target.selector);
        if (!elements.length) continue;
        gsap.fromTo(
          elements,
          { ...DEFAULT_FROM, ...target.from },
          {
            ...DEFAULT_TO,
            ...target.to,
            stagger: target.stagger,
            scrollTrigger: {
              trigger: containerRef.current,
              start: target.triggerStart ?? "top 80%",
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return containerRef;
}
