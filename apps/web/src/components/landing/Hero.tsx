"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

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
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        sectionRef.current.querySelector(".hero-headline"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      )
        .fromTo(
          sectionRef.current.querySelector(".hero-subheadline"),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          sectionRef.current.querySelector(".hero-ctas"),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.3",
        )
        .fromTo(
          terminalRef.current,
          { y: 30, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7 },
          "-=0.2",
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="hero-headline text-5xl font-bold tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-[var(--color-accent)] to-purple-400 bg-clip-text text-transparent">
            MockForge
          </span>
        </h1>
        <p className="hero-headline mt-4 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">
          Fake Data, Real Power
        </p>
        <p className="hero-subheadline mt-6 text-lg text-[var(--color-text-muted)] sm:text-xl">
          Instant REST, GraphQL, WebSocket, and Socket.io APIs for prototyping and testing. No
          signup, no tokens — just data.
        </p>

        <div className="hero-ctas mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition-all hover:brightness-110"
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

        <div
          ref={terminalRef}
          className="mx-auto mt-12 w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-medium text-[var(--color-code-text)]">
              {activeSnippet.label}
            </span>
          </div>
          <pre className="p-5 text-left font-mono text-sm leading-relaxed text-[var(--color-code-text)]">
            <code>
              {displayedCode}
              <span className="inline-block h-4 w-1.5 animate-pulse bg-[var(--color-accent)] align-middle" />
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
