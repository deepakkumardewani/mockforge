"use client";

import { useEffect, useRef } from "react";

function findFumadocsLink(cached: HTMLLinkElement | null): HTMLLinkElement | null {
  if (cached?.isConnected) return cached;

  const byHref = document.querySelector<HTMLLinkElement>(
    'link[rel="stylesheet"][href*="fumadocs"]',
  );
  if (byHref) return byHref;

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
}

function setDocsStylesheetEnabled(link: HTMLLinkElement, enabled: boolean) {
  // "print" never matches a screen viewport, so the unlayered fumadocs sheet
  // cannot beat app utilities after leaving /docs. Keep the node so we can
  // re-enable it on the next docs visit.
  link.media = enabled ? "all" : "print";
}

export function DocsStyleGate() {
  const cachedLink = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    const apply = (enabled: boolean) => {
      const link = findFumadocsLink(cachedLink.current);
      if (!link) return;
      cachedLink.current = link;
      setDocsStylesheetEnabled(link, enabled);
    };

    apply(true);

    const observer = new MutationObserver(() => apply(true));
    observer.observe(document.head, { childList: true });

    return () => {
      observer.disconnect();
      apply(false);
    };
  }, []);

  return null;
}
