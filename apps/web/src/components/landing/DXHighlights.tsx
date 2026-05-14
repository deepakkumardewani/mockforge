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
  const [activeTab, setActiveTab] = useState<Tab>("JavaScript");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll(".dx-animate"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(CODE_SAMPLES[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section ref={sectionRef} className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="dx-animate mb-16 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            Copy, Paste, Build
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            No SDKs to install. No tokens to manage. Just a URL and your favorite HTTP client.
          </p>
        </div>

        <div className="dx-animate mx-auto max-w-2xl">
          {/* Tabs */}
          <div className="flex rounded-t-xl border border-b-0 border-[var(--color-border)] bg-[var(--color-surface-raised)]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto flex items-center pr-3">
              <button
                onClick={handleCopy}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Code block */}
          <div className="overflow-hidden rounded-b-xl border border-[var(--color-border)] bg-[var(--color-code-bg)]">
            <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-[var(--color-code-text)]">
              <code>{CODE_SAMPLES[activeTab]}</code>
            </pre>
          </div>
        </div>

        {/* Zero signup callout */}
        <div className="dx-animate mx-auto mt-12 flex max-w-lg items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-green-500"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-primary)]">Zero signup.</span> No
            API keys, no rate-limit tiers, no login walls. Just open the URL and go.
          </p>
        </div>
      </div>
    </section>
  );
}
