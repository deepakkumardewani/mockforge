"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { DepthTexture, SECTION_IDENTITY } from "./depth";

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

const PROOF_ITEMS = [
  { label: "Protocols", value: "4 wire formats" },
  { label: "Resources", value: "15 typed" },
  { label: "Auth", value: "Keyless access" },
  { label: "Real-time", value: "WS + Socket.io" },
] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLParagraphElement>(null);
  const proofStripRef = useRef<HTMLDivElement>(null);

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
        !terminalRef.current ||
        !proofStripRef.current
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
        )
        .fromTo(
          proofStripRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" },
          "-=0.4",
        );
    }, sectionRef);

    return () => {
      clearTimeout(startTyping);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!typingStarted) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const snippet = CODE_SNIPPETS[snippetIndex];
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
  }, [charIndex, isDeleting, snippetIndex, typingStarted]);

  const activeSnippet = CODE_SNIPPETS[snippetIndex];

  return (
    <section
      ref={sectionRef}
      className={`${SECTION_IDENTITY.hero} flex min-h-screen flex-col px-6 pt-24 pb-12 sm:px-10 lg:px-16`}
    >
      <DepthTexture variant="dot" className="opacity-40" />

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

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div ref={headlineRef} className="overflow-hidden" aria-label="Fake Data. Real Power.">
              <p className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-text-primary)]">
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
              className="mt-6 max-w-[42ch] text-lg leading-relaxed text-[var(--color-text-muted)]"
            >
              REST, GraphQL, WebSocket, and Socket.io on one mock server — point your client and go.
            </p>

            <div ref={ctasRef} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/playground"
                className="rounded-lg px-6 py-3 font-semibold transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-on-accent)",
                }}
              >
                Open Playground
              </Link>
              <Link
                href="/docs"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-3 font-medium text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Read the Docs
              </Link>
            </div>

            <p ref={socialProofRef} className="mt-8 text-sm text-[var(--color-text-muted)]">
              No signup · No API keys ·{" "}
              <span style={{ color: "var(--color-accent)" }} className="font-medium">
                15 typed resources
              </span>{" "}
              · 4 protocols, one schema
            </p>
          </div>

          <div ref={terminalRef} className="relative">
            {/* Layered terminal stack — depth behind primary */}
            <div
              className="pointer-events-none absolute inset-x-4 top-6 hidden h-full rounded-xl border border-[var(--color-border)] opacity-30 sm:block"
              style={{ background: "var(--color-code-bg)", transform: "rotate(-2deg) scale(0.96)" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-2 top-3 hidden h-full rounded-xl border border-[var(--color-border)] opacity-50 sm:block"
              style={{ background: "var(--color-code-bg)", transform: "rotate(1deg) scale(0.98)" }}
              aria-hidden
            />

            <div
              className="relative overflow-hidden rounded-xl border border-[var(--color-border)] shadow-2xl"
              style={{ background: "var(--color-code-bg)" }}
            >
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
                <div className="flex items-center gap-1">
                  {CODE_SNIPPETS.map((s, i) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={`Show ${s.label} code sample`}
                      aria-pressed={snippetIndex === i}
                      onClick={() => {
                        setSnippetIndex(i);
                        setCharIndex(0);
                        setIsDeleting(false);
                        setDisplayedCode("");
                      }}
                      className="rounded px-2 py-0.5 font-mono text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]"
                      style={
                        snippetIndex === i
                          ? {
                              color: "var(--color-accent)",
                              background: "var(--color-surface-hover)",
                            }
                          : { color: "var(--color-text-muted)" }
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <pre className="min-h-52 p-5 font-mono text-sm leading-relaxed text-[var(--color-code-text)] sm:min-h-56">
                <code>
                  {displayedCode}
                  <span
                    className="inline-block h-4 w-1.5 animate-pulse align-middle motion-reduce:animate-none"
                    style={{ background: "var(--color-accent)" }}
                  />
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Honest proof strip — fills lower viewport */}
      <div
        ref={proofStripRef}
        className="relative z-10 mx-auto mt-auto w-full max-w-7xl pt-10"
      >
        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)] sm:grid-cols-4"
          style={{ background: "var(--color-border)" }}
        >
          {PROOF_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 px-5 py-4"
              style={{ background: "var(--color-surface-raised)" }}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
                {item.label}
              </span>
              <span className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
