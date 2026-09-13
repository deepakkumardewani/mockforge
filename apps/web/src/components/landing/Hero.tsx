"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { DepthTexture, SECTION_IDENTITY } from "./depth";
import { API_BASE } from "@/lib/api-client";

function toWsOrigin(httpBase: string): string {
  try {
    const url = new URL(httpBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.origin;
  } catch {
    return httpBase.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
  }
}

function buildSnippets(apiBase: string) {
  const wsOrigin = toWsOrigin(apiBase);
  return [
    {
      label: "REST",
      code: `GET ${apiBase}/api/products?limit=3

HTTP/1.1 200 OK
{
  "data": [
    { "id": 1, "title": "Wireless Mouse", "price": 29.99 }
  ],
  "total": 50,
  "limit": 3,
  "skip": 0
}`,
    },
    {
      label: "GraphQL",
      code: `POST ${apiBase}/graphql

query {
  products(limit: 3) {
    title
    price
    category
  }
}`,
    },
    {
      label: "WebSocket",
      code: `const ws = new WebSocket(
  "${wsOrigin}/ws/stats"
);

ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  console.log(payload.total);
};`,
    },
  ] as const;
}

/** Fits the longest CODE_SNIPPETS entry so typing never resizes the card. */
const TERMINAL_HEIGHT_CLASS = "h-[21.5rem] sm:h-[22.5rem]";
const TERMINAL_STACK_SHELL_CLASS = "h-[23.5rem] sm:h-[24.5rem]";
const TERMINAL_BORDER_CLASS = "border-[var(--color-border)] dark:border-[oklch(0.38_0.014_65)]";
const TERMINAL_BORDER_STRONG_CLASS =
  "border-[var(--color-border)] dark:border-[oklch(0.44_0.016_65)]";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLParagraphElement>(null);
  const snippets = useMemo(() => buildSnippets(API_BASE), []);

  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);

  useEffect(() => {
    const startTyping = setTimeout(() => setTypingStarted(true), 700);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => clearTimeout(startTyping);
    }
    const ctx = gsap.context(() => {
      if (
        !headlineRef.current ||
        !subRef.current ||
        !ctasRef.current ||
        !socialProofRef.current ||
        !terminalRef.current
      )
        return;

      const words = headlineRef.current.querySelectorAll(".word");
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        words,
        { clipPath: "inset(0 100% 0 0)", y: 8 },
        { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.7, stagger: 0.08 },
      )
        .fromTo(subRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
        .fromTo(
          ctasRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.3",
        )
        .fromTo(
          socialProofRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
          "-=0.35",
        )
        .fromTo(
          terminalRef.current,
          { x: 60, opacity: 0, rotate: 2 },
          { x: 0, opacity: 1, rotate: 0, duration: 0.9, ease: "power3.out" },
          "-=0.6",
        );
    }, sectionRef);

    return () => {
      clearTimeout(startTyping);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!typingStarted) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const snippet = snippets[snippetIndex];
    const fullText = snippet.code;

    if (prefersReducedMotion) {
      setDisplayedCode(fullText);
      setCharIndex(fullText.length);
      setIsDeleting(false);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (charIndex < fullText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedCode(fullText.slice(0, charIndex + 1));
            setCharIndex(charIndex + 1);
          },
          20 + Math.random() * 15,
        );
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2500);
      }
    } else if (charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayedCode(fullText.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 8);
    } else {
      setIsDeleting(false);
      setSnippetIndex((snippetIndex + 1) % snippets.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, snippetIndex, snippets, typingStarted]);

  const activeSnippet = snippets[snippetIndex];

  return (
    <section
      ref={sectionRef}
      className={`${SECTION_IDENTITY.hero} flex min-h-screen flex-col px-6 pt-24 pb-16 sm:px-10 lg:px-16`}
    >
      <DepthTexture variant="dot" />

      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
        <div
          className="hero-mesh-a absolute -top-1/3 -left-1/4 h-[70vw] w-[70vw] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          }}
        />
        <div
          className="hero-mesh-b absolute -bottom-1/4 -right-1/4 h-[55vw] w-[55vw] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div
              ref={headlineRef}
              className="overflow-hidden"
              aria-label="Build your app before the backend is ready."
            >
              <p className="font-display text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-tight text-[var(--color-text-primary)]">
                {["Build", "your", "app"].map((word) => (
                  <span key={word} className="word mr-[0.25em] inline-block last:mr-0">
                    {word}
                  </span>
                ))}
                <br />
                {["before", "the", "backend", "is", "ready."].map((word) => (
                  <span key={word} className="word mr-[0.25em] inline-block last:mr-0">
                    {word}
                  </span>
                ))}
              </p>
            </div>

            <p
              ref={subRef}
              className="mt-6 max-w-[44ch] text-lg leading-relaxed text-[var(--color-text-muted)]"
            >
              MockForge gives your app ready-to-use REST, GraphQL, WebSocket, and Socket.io
              endpoints from one typed schema. No backend setup required.
            </p>

            <div ref={ctasRef} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#integration"
                className="landing-btn-primary rounded-lg px-6 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-on-accent)",
                }}
              >
                Use the API
              </Link>
              <Link
                href="/playground"
                className="landing-btn-secondary rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-3 font-medium text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Explore in Playground
              </Link>
            </div>

            <p ref={socialProofRef} className="mt-8 text-sm text-[var(--color-text-muted)]">
              No signup. No API keys.{" "}
              <span style={{ color: "var(--color-accent)" }} className="font-medium">
                15 typed resources
              </span>
              , including custom schemas in the Builder.
            </p>
          </div>

          <div ref={terminalRef} className="relative w-full min-w-0 pt-2">
            <div className={`relative w-full ${TERMINAL_STACK_SHELL_CLASS}`}>
              <div
                className="pointer-events-none absolute left-0 top-8 right-[2.75rem] bottom-0 rounded-xl border-2 shadow-lg"
                style={{
                  background: "var(--color-surface-raised)",
                  borderColor: "color-mix(in oklch, var(--color-accent) 50%, var(--color-border))",
                  transform: "rotate(-5deg) translate(6px, 12px)",
                }}
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute left-10 top-3 right-0 bottom-7 rounded-xl border shadow-md sm:left-12 sm:bottom-8 ${TERMINAL_BORDER_STRONG_CLASS}`}
                style={{
                  background: "var(--color-code-bg)",
                  transform: "rotate(3deg) translate(-4px, 8px)",
                }}
                aria-hidden
              />

              <div
                className={`absolute inset-x-0 top-0 z-10 flex ${TERMINAL_HEIGHT_CLASS} w-full flex-col overflow-hidden rounded-xl border shadow-2xl ${TERMINAL_BORDER_STRONG_CLASS}`}
                style={{ background: "var(--color-code-bg)" }}
              >
                <div
                  className={`flex shrink-0 items-center justify-between gap-2 border-b px-3 py-3 sm:px-4 ${TERMINAL_BORDER_CLASS}`}
                  style={{ background: "var(--color-surface-raised)" }}
                >
                  <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <span
                      className="h-0.5 w-8 rounded-full"
                      style={{ background: "var(--color-accent)" }}
                    />
                    <span className="font-mono text-xs font-medium text-[var(--color-text-muted)]">
                      {activeSnippet.label}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
                    {snippets.map((snippet, i) => (
                      <button
                        key={snippet.label}
                        type="button"
                        aria-label={`Show ${snippet.label} request sample`}
                        aria-pressed={snippetIndex === i}
                        onClick={() => {
                          setSnippetIndex(i);
                          setCharIndex(0);
                          setIsDeleting(false);
                          setDisplayedCode("");
                        }}
                        className="landing-tab shrink-0 rounded px-2 py-0.5 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]"
                        style={
                          snippetIndex === i
                            ? {
                                color: "var(--color-accent)",
                                background: "var(--color-surface-hover)",
                              }
                            : { color: "var(--color-text-muted)" }
                        }
                      >
                        {snippet.label}
                      </button>
                    ))}
                  </div>
                </div>

                <pre className="min-h-0 flex-1 overflow-hidden p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-[var(--color-code-text)] sm:p-5 sm:text-sm">
                  <code className="block">
                    {displayedCode}
                    <span
                      className="inline-block h-3.5 w-1.5 animate-pulse align-middle motion-reduce:animate-none sm:h-4"
                      style={{ background: "var(--color-accent)" }}
                    />
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
