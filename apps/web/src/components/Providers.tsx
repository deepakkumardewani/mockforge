"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Forces ScrollTrigger to recalculate positions on every route change so
// GSAP entrance animations re-trigger correctly after SPA navigation.
function ScrollTriggerRefresher() {
  const pathname = usePathname();

  useEffect(() => {
    // Defer past React's effect cycle so all page components can register
    // their ScrollTrigger instances before we force a position recalculation.
    const id = setTimeout(() => ScrollTrigger.refresh(true), 50);
    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}

// fumadocs-ui/style.css is Tailwind v3 compiled as plain unlayered CSS.
// Our app uses Tailwind v4 which puts utilities in @layer utilities.
// CSS cascade: unlayered always beats layered, regardless of specificity or
// source order. So fumadocs' .grid-cols-2 (unlayered) beats our
// @layer utilities .lg:grid-cols-7, collapsing grids to 2 columns on landing.
//
// Fix: suppress the fumadocs <link> element when outside /docs by switching
// its media to "print" (screens don't match, so it's effectively disabled).
// Using media instead of link.disabled avoids browser re-enable reliability
// issues and keeps the element in document.styleSheets so we can find it again.
function FumadocsStyleGate() {
  const pathname = usePathname();
  const cachedLink = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    const isDocsPage = pathname.startsWith("/docs");

    const findFumadocsLink = (): HTMLLinkElement | null => {
      // Re-use cached ref if still connected to the DOM
      if (cachedLink.current?.isConnected) return cachedLink.current;

      // Dev: chunk URL contains the module path (includes "fumadocs")
      const byHref = document.querySelector<HTMLLinkElement>(
        'link[rel="stylesheet"][href*="fumadocs"]',
      );
      if (byHref) return byHref;

      // Prod fallback: scan stylesheets for a fumadocs-specific selector.
      // Note: disabled sheets are absent from document.styleSheets, so this
      // fallback only runs before we've suppressed the sheet (first visit).
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule instanceof CSSStyleRule && rule.selectorText?.includes("fd-codeblock")) {
              return sheet.ownerNode instanceof HTMLLinkElement ? sheet.ownerNode : null;
            }
          }
        } catch {
          // Cross-origin sheets throw on cssRules access — skip them
        }
      }
      return null;
    };

    const applyGate = () => {
      const link = findFumadocsLink();
      if (!link) return;
      cachedLink.current = link;
      // "print" never matches a screen viewport, effectively suppressing the
      // sheet without removing it from the DOM (so querySelector finds it later)
      link.media = isDocsPage ? "all" : "print";
    };

    applyGate();

    // The fumadocs CSS chunk is injected dynamically the first time /docs is
    // visited — watch for that insertion so we can gate it immediately.
    const observer = new MutationObserver(applyGate);
    observer.observe(document.head, { childList: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ScrollTriggerRefresher />
      <FumadocsStyleGate />
      <ThemeToggle />
      {children}
    </QueryProvider>
  );
}
