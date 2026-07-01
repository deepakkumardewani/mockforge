"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

const TABS = ["JavaScript", "Python", "cURL"] as const;
type Tab = (typeof TABS)[number];

const CODE_SAMPLES: Record<Tab, string> = {
  JavaScript: `// Create a user via REST
const res = await fetch("http://localhost:4000/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Alex",
    lastName: "Dev",
    email: "alex@example.com",
  }),
});

const user = await res.json();
console.log(user.id, user.username);`,
  Python: `import requests

# Create a user via REST
resp = requests.post(
    "http://localhost:4000/api/users",
    json={
        "firstName": "Alex",
        "lastName": "Dev",
        "email": "alex@example.com",
    },
)

user = resp.json()
print(user["id"], user["username"])`,
  cURL: `# Create a user via REST
curl -X POST "http://localhost:4000/api/users" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Alex",
    "lastName": "Dev",
    "email": "alex@example.com"
  }'

# Response includes generated id + username
# { "id": 42, "username": "alexdev", ... }`,
};

export function DXHighlights() {
  const containerRef = useRevealOnScroll([{ selector: ".dx-animate", stagger: 0.12 }]);
  const codeRef = useRef<HTMLPreElement>(null);
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
    await navigator.clipboard.writeText(CODE_SAMPLES[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.dxHighlights}>
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="dx-animate">
          <span
            className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            Integration
          </span>
          <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
            Wire it in minutes
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
            Point fetch, requests, or curl at the mock server — create a user in three lines.
          </p>

          <div
            className="mt-8 flex items-start gap-4 rounded-xl border border-[var(--color-border)] p-5"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <span
              className="mt-0.5 shrink-0 font-mono text-sm font-bold"
              style={{ color: "var(--color-accent)" }}
            >
              →
            </span>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text-primary)]">Runs locally.</span>{" "}
              Spin up the mock server, hit the same endpoints in CI, and keep your frontend
              decoupled from backend availability.
            </p>
          </div>
        </div>

        <div className="dx-animate min-w-0">
          <div
            className="flex items-end overflow-hidden rounded-t-xl border border-b-0 border-[var(--color-border)]"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <div role="tablist" aria-label="Code samples" className="flex flex-1 items-end">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`dx-tab-${tab}`}
                  aria-selected={activeTab === tab}
                  aria-controls="dx-code-panel"
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
            id="dx-code-panel"
            role="tabpanel"
            aria-labelledby={`dx-tab-${activeTab}`}
            className="overflow-hidden rounded-b-xl border border-[var(--color-border)]"
            style={{ background: "var(--color-code-bg)" }}
          >
            <pre
              ref={codeRef}
              className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-[var(--color-code-text)]"
            >
              <code>{CODE_SAMPLES[visibleTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </Section>
  );
}
