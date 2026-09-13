"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

const COMPARISONS = [
  {
    alternative: "Hand-maintained fixtures",
    limitation: "JSON files drift as UI contracts change and rarely cover live transports.",
    mockforge: "One typed schema served as REST, GraphQL, WebSocket, and Socket.io.",
  },
  {
    alternative: "Generic placeholder JSON APIs",
    limitation: "Untyped payloads and usually a single HTTP surface.",
    mockforge: "15 typed resources with limit/skip pagination, search, and sort.",
  },
] as const;

export function WhyMockForge() {
  const containerRef = useRevealOnScroll([
    { selector: ".why-animate", stagger: 0.1, triggerStart: "top 82%" },
  ]);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.whyMockForge} id="why">
      <div className="why-animate mb-12 max-w-2xl">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Differentiation
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Replace fixtures with a typed hosted API
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          MockForge is a hosted mock API you call from your app. Playground is only for testing and
          exploring endpoints.
        </p>
      </div>

      <div
        className="why-animate overflow-x-auto rounded-xl border border-[var(--color-border)]"
        style={{ background: "var(--color-border)" }}
      >
        <table className="min-w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparison of MockForge with maintained fixtures and generic placeholder APIs
          </caption>
          <thead style={{ background: "var(--color-surface)" }}>
            <tr>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]"
              >
                Approach
              </th>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]"
              >
                Constraint
              </th>
              <th
                scope="col"
                className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]"
              >
                MockForge
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISONS.map((row) => (
              <tr key={row.alternative} style={{ background: "var(--color-surface-raised)" }}>
                <th
                  scope="row"
                  className="border-t border-[var(--color-border)] px-5 py-4 font-display font-semibold text-[var(--color-text-primary)]"
                >
                  {row.alternative}
                </th>
                <td className="border-t border-[var(--color-border)] px-5 py-4 text-[var(--color-text-muted)]">
                  {row.limitation}
                </td>
                <td className="border-t border-[var(--color-border)] px-5 py-4 text-[var(--color-text-primary)]">
                  {row.mockforge}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
