import { useCallback, useEffect, useState, type RefObject } from "react";

const TYPING_START_DELAY_MS = 700;
const TYPE_INTERVAL_MS = 28;
const TYPE_JITTER_MS = 12;
const DELETE_INTERVAL_MS = 32;
const HOLD_AFTER_TYPE_MS = 2_500;

export interface HeroSnippet {
  readonly label: string;
  readonly code: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function typeDelayMs(): number {
  return TYPE_INTERVAL_MS + Math.random() * TYPE_JITTER_MS;
}

export function useHeroTyping(
  snippets: readonly HeroSnippet[],
  targetRef?: RefObject<HTMLElement | null>,
) {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    const startTyping = window.setTimeout(() => setTypingStarted(true), TYPING_START_DELAY_MS);
    return () => window.clearTimeout(startTyping);
  }, []);

  useEffect(() => {
    const node = targetRef?.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsOnScreen(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [targetRef]);

  useEffect(() => {
    if (!typingStarted) return;

    const snippet = snippets[snippetIndex];
    const fullText = snippet.code;

    if (prefersReducedMotion()) {
      setDisplayedCode(fullText);
      setCharIndex(fullText.length);
      setIsDeleting(false);
      return;
    }

    if (!isOnScreen) return;

    let timeoutId = 0;
    let cancelled = false;
    let visibilityHandler: (() => void) | null = null;

    const runWhenVisible = (work: () => void) => {
      if (cancelled) return;
      if (document.hidden) {
        visibilityHandler = () => {
          if (visibilityHandler) {
            document.removeEventListener("visibilitychange", visibilityHandler);
            visibilityHandler = null;
          }
          runWhenVisible(work);
        };
        document.addEventListener("visibilitychange", visibilityHandler);
        return;
      }
      work();
    };

    const schedule = (delayMs: number, work: () => void) => {
      timeoutId = window.setTimeout(() => runWhenVisible(work), delayMs);
    };

    if (!isDeleting) {
      if (charIndex < fullText.length) {
        schedule(typeDelayMs(), () => {
          setDisplayedCode(fullText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        });
      } else {
        schedule(HOLD_AFTER_TYPE_MS, () => setIsDeleting(true));
      }
    } else if (charIndex > 0) {
      schedule(DELETE_INTERVAL_MS, () => {
        setDisplayedCode(fullText.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      });
    } else {
      setIsDeleting(false);
      setSnippetIndex((snippetIndex + 1) % snippets.length);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
  }, [charIndex, isDeleting, isOnScreen, snippetIndex, snippets, typingStarted]);

  const selectSnippet = useCallback((index: number) => {
    setSnippetIndex(index);
    setCharIndex(0);
    setIsDeleting(false);
    setDisplayedCode("");
  }, []);

  return { snippetIndex, displayedCode, selectSnippet };
}
