"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TABS = ["JavaScript", "Python", "cURL"] as const;
type Tab = (typeof TABS)[number];

const CODE_SAMPLES: Record<Tab, string> = {
  JavaScript: `// Fetch products from MockForge
const res = await fetch(
  "http://localhost:4000/api/products?limit=5"
);

const { data, total } = await res.json();

data.forEach((product) => {
  console.log(\`\${product.title}: $\${product.price}\`);
});

// Response includes pagination metadata
console.log(\`Showing \${data.length} of \${total}\`);`,
  Python: `import requests

# Fetch products from MockForge
resp = requests.get(
    "http://localhost:4000/api/products",
    params={"limit": 5}
)

body = resp.json()
for product in body["data"]:
    print(f'{product["title"]}: $' + str(product["price"]))

# Response includes pagination metadata
print(f'Showing {len(body["data"])} of {body["total"]}')`,
  cURL: `# Fetch products from MockForge
curl "http://localhost:4000/api/products?limit=5"

# Response:
# {
#   "data": [
#     { "title": "Product 1", "price": 29.99 },
#     ...
#   ],
#   "total": 142,
#   "limit": 5,
#   "skip": 0
# }

# With custom identity header
curl -H "X-MF-ID: my-custom-id" \\
  "http://localhost:4000/api/products"`,
};

export function DXHighlights() {
  const sectionRef = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("JavaScript");
  const [visibleTab, setVisibleTab] = useState<Tab>("JavaScript");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll(".dx-animate"),
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Fade out → swap content → fade in on tab change
  function handleTabChange(tab: Tab) {
    if (tab === activeTab) return;
    if (!codeRef.current) {
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
    <section ref={sectionRef} className="px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="dx-animate mb-16">
          <span
            className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            Quick start
          </span>
          <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
            Copy, paste, build
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            No SDKs to install. No tokens to manage. Just a URL and your favourite HTTP client.
          </p>
        </div>

        <div className="dx-animate mx-auto max-w-2xl">
          {/* Tab bar */}
          <div
            className="flex items-end border-b border-[var(--color-border)]"
            style={{ background: "var(--color-surface-raised)" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="relative px-5 py-3 text-sm font-medium transition-colors"
                style={{
                  color: activeTab === tab ? "var(--color-accent)" : "var(--color-text-muted)",
                }}
              >
                {tab}
                {/* Underline indicator */}
                {activeTab === tab && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5"
                    style={{ background: "var(--color-accent)" }}
                  />
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center pr-3">
              <button
                onClick={handleCopy}
                className="rounded px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  color: copied ? "var(--color-accent)" : "var(--color-text-muted)",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Code block */}
          <div
            className="overflow-hidden rounded-b-xl border border-t-0 border-[var(--color-border)]"
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

        {/* Zero-signup callout */}
        <div className="dx-animate mx-auto mt-10 max-w-2xl">
          <div
            className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] p-5"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <span
              className="mt-0.5 shrink-0 font-mono text-sm font-bold"
              style={{ color: "var(--color-accent)" }}
            >
              →
            </span>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text-primary)]">Zero signup.</span>{" "}
              No API keys, no rate-limit tiers, no login walls. Open the URL and go.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
