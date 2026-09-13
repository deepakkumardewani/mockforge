"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";
import { API_BASE } from "@/lib/api-client";

const TABS = ["JavaScript", "Python", "cURL"] as const;
type Tab = (typeof TABS)[number];

function buildSamples(apiBase: string): Record<Tab, string> {
  const url = `${apiBase}/api/users?limit=5`;
  return {
    JavaScript: `const res = await fetch("${url}");
const payload = await res.json();
console.log(payload.data);`,
    Python: `import requests

resp = requests.get("${url}")
payload = resp.json()
print(payload["data"])`,
    cURL: `curl "${url}"`,
  };
}

const POINTS = [
  {
    title: "Use the API origin",
    detail:
      "Copy the base URL shown with the examples into your client. That origin is the MockForge API.",
  },
  {
    title: "Keep normal resource paths",
    detail:
      "Call routes such as /api/users the same way you would any REST API. Query params and payloads do not change.",
  },
  {
    title: "Start with a GET",
    detail:
      "Reads return generated, typed records. Writes work for exploration and are not persisted.",
  },
] as const;

export function Quickstart() {
  const containerRef = useRevealOnScroll([
    { selector: ".quickstart-animate", stagger: 0.12, triggerStart: "top 82%" },
  ]);
  const codeRef = useRef<HTMLPreElement>(null);
  const samples = buildSamples(API_BASE);
  const [activeTab, setActiveTab] = useState<Tab>("JavaScript");
  const [visibleTab, setVisibleTab] = useState<Tab>("JavaScript");
  const [copied, setCopied] = useState(false);

  function handleTabChange(tab: Tab) {
    if (tab === activeTab) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !codeRef.current) {
      setActiveTab(tab);
      setVisibleTab(tab);
      return;
    }
    gsap.to(codeRef.current, {
      opacity: 0,
      duration: 0.12,
      ease: "power1.in",
      onComplete: () => {
        setVisibleTab(tab);
        setActiveTab(tab);
        gsap.to(codeRef.current, { opacity: 1, duration: 0.18, ease: "power1.out" });
      },
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(samples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Section id="integration" ref={containerRef} className={SECTION_IDENTITY.quickstart}>
      <div className="quickstart-animate mb-12 max-w-2xl">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Integration
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Connect your app to the MockForge API
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Set your client’s origin to the URL below and keep the resource paths you already use. The
          samples call that origin.
        </p>
      </div>

      <div className="quickstart-animate grid items-start gap-10 lg:grid-cols-2">
        <ol className="space-y-6">
          {POINTS.map((item) => (
            <li key={item.title}>
              <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {item.detail}
              </p>
            </li>
          ))}
        </ol>

        <div className="min-w-0">
          <div
            className="flex items-end overflow-hidden rounded-t-xl border border-b-0 border-[var(--color-border)]"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <div role="tablist" aria-label="Client examples" className="flex flex-1 items-end">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`quickstart-tab-${tab}`}
                  aria-selected={activeTab === tab}
                  aria-controls="quickstart-code-panel"
                  onClick={() => handleTabChange(tab)}
                  className="relative px-5 py-3 text-sm font-medium landing-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]"
                  style={{
                    color: activeTab === tab ? "var(--color-accent)" : "var(--color-text-muted)",
                  }}
                >
                  {tab}
                  {activeTab === tab && (
                    <span
                      className="absolute inset-x-0 bottom-0 h-0.5"
                      style={{ background: "var(--color-accent)" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center pr-3">
              <span className="sr-only" aria-live="polite">
                {copied ? "Code copied to clipboard" : ""}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Copied to clipboard" : "Copy code sample"}
                className="landing-btn-ghost rounded px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                style={{
                  color: copied ? "var(--color-accent)" : "var(--color-text-muted)",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div
            id="quickstart-code-panel"
            role="tabpanel"
            aria-labelledby={`quickstart-tab-${activeTab}`}
            className="overflow-hidden rounded-b-xl border border-[var(--color-border)]"
            style={{ background: "var(--color-code-bg)" }}
          >
            <pre
              ref={codeRef}
              className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-[var(--color-code-text)]"
            >
              <code>{samples[visibleTab]}</code>
            </pre>
          </div>

          <p className="mt-4 font-mono text-xs text-[var(--color-text-muted)]">
            Base URL {API_BASE}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/docs/getting-started/quickstart"
              className="landing-btn-primary inline-flex rounded-lg px-6 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
              }}
            >
              Read the Docs
            </Link>
            <Link
              href="/playground"
              className="inline-flex text-sm font-medium text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Explore in Playground
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
