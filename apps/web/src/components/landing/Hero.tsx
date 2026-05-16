"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";

const CODE_SNIPPETS = [
  {
    label: "REST",
    code: `GET /api/products?limit=5&sort=price

// Response
{
  "data": [
    { "title": "Wireless Mouse", ... },
    { "title": "USB-C Hub", ... },
    ...
  ],
  "total": 142,
  "limit": 5,
  "skip": 0
}`,
  },
  {
    label: "GraphQL",
    code: `query {
  products(limit: 3) {
    title
    price
    rating
    category
  }
}`,
  },
  {
    label: "WebSocket",
    code: `const ws = new WebSocket(
  "ws://api.mockforge.dev/ws/stats"
);

ws.onmessage = (event) => {
  const { total } = JSON.parse(event.data);
  console.log(\`Requests served: \${total}\`);
};`,
  },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLParagraphElement>(null);

  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Orchestrated entrance
  useEffect(() => {
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

    return () => ctx.revert();
  }, []);

  // Typewriter
  useEffect(() => {
    const snippet = CODE_SNIPPETS[snippetIndex];
    const fullText = snippet.code;
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
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedCode(fullText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 8);
      } else {
        setIsDeleting(false);
        setSnippetIndex((snippetIndex + 1) % CODE_SNIPPETS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, snippetIndex]);

  const activeSnippet = CODE_SNIPPETS[snippetIndex];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden px-6 pt-24 pb-20 sm:px-10 lg:px-16"
    >
      {/* Ambient mesh background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
        {/* Left column — text */}
        <div>
          {/* Wordmark badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1">
            <span
              className="font-display text-sm font-bold tracking-widest uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              MockForge
            </span>
            <span className="h-1 w-1 rounded-full" style={{ background: "var(--color-accent)" }} />
            <span className="text-xs text-[var(--color-text-muted)]">v2</span>
          </div>

          {/* Headline — word-by-word clip-path */}
          <div ref={headlineRef} className="overflow-hidden" aria-label="Fake Data. Real Power.">
            <p className="font-display text-5xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-6xl xl:text-7xl">
              {["Fake", "Data."].map((word) => (
                <span key={word} className="word mr-[0.25em] inline-block last:mr-0">
                  {word}
                </span>
              ))}
              <br />
              {["Real", "Power."].map((word) => (
                <span key={word} className="word mr-[0.25em] inline-block last:mr-0">
                  {word}
                </span>
              ))}
            </p>
          </div>

          <p
            ref={subRef}
            className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-text-muted)]"
          >
            Instant REST, GraphQL, WebSocket, and Socket.io APIs for prototyping and testing. No
            signup, no tokens — just data.
          </p>

          <div ref={ctasRef} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/docs"
              className="rounded-lg px-6 py-3 font-semibold text-[var(--color-surface)] transition-all hover:brightness-110"
              style={{ background: "var(--color-accent)" }}
            >
              Explore Docs
            </Link>
            <Link
              href="/builder"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-3 font-medium text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-surface-hover)]"
            >
              Try the Builder
            </Link>
          </div>

          {/* Social proof line */}
          <p ref={socialProofRef} className="mt-10 text-sm text-[var(--color-text-muted)]">
            No registration ·{" "}
            <span style={{ color: "var(--color-accent)" }} className="font-medium">
              4 protocols
            </span>{" "}
            · 14 entity types ·{" "}
            <span style={{ color: "var(--color-accent)" }} className="font-medium">
              zero setup
            </span>
          </p>
        </div>

        {/* Right column — terminal */}
        <div ref={terminalRef}>
          <div
            className="overflow-hidden rounded-xl border border-[var(--color-border)] shadow-2xl"
            style={{ background: "var(--color-code-bg)" }}
          >
            {/* Terminal header — amber accent bar instead of traffic lights */}
            <div
              className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3"
              style={{ background: "var(--color-surface-raised)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-0.5 w-8 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
                <span className="font-mono text-xs font-medium text-[var(--color-text-muted)]">
                  {activeSnippet.label}
                </span>
              </div>
              {/* Protocol tabs */}
              <div className="flex items-center gap-1">
                {CODE_SNIPPETS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setSnippetIndex(i);
                      setCharIndex(0);
                      setIsDeleting(false);
                      setDisplayedCode("");
                    }}
                    className="rounded px-2 py-0.5 font-mono text-xs transition-colors"
                    style={
                      snippetIndex === i
                        ? { color: "var(--color-accent)", background: "var(--color-surface-hover)" }
                        : { color: "var(--color-text-muted)" }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <pre className="min-h-48 p-5 font-mono text-sm leading-relaxed text-[var(--color-code-text)]">
              <code>
                {displayedCode}
                <span
                  className="inline-block h-4 w-1.5 animate-pulse align-middle"
                  style={{ background: "var(--color-accent)" }}
                />
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
