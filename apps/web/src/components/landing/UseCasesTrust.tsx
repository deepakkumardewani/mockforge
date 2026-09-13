"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

const SCENARIOS = [
  {
    title: "Frontend development",
    setup: "The interface is ready, but the production API is not.",
    action:
      "Point the app at the MockForge origin and render against paginated, typed REST or GraphQL resources.",
  },
  {
    title: "Integration tests",
    setup: "CI needs predictable HTTP without standing up a full backend.",
    action:
      "Call the same paths the client uses. Responses follow a documented envelope; mutations are not a source of truth.",
  },
  {
    title: "Protocol comparison",
    setup: "You need HTTP and a live channel against the same data model.",
    action:
      "Read Product over REST, then subscribe to the matching WebSocket or Socket.io stream to compare the two.",
  },
  {
    title: "Product demos",
    setup: "A walkthrough should show live responses, not screenshots of fixtures.",
    action: "Issue GET requests during the session so the audience sees real JSON from the API.",
  },
] as const;

export function UseCasesTrust() {
  const containerRef = useRevealOnScroll([
    { selector: ".usecase-animate", stagger: 0.1, triggerStart: "top 82%" },
  ]);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.useCases}>
      <div className="usecase-animate mb-12 max-w-2xl">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Scenarios
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Where teams call the API from an existing app
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Frontend work, CI, protocol checks, and live demos all use the same origin and resource
          paths.
        </p>
      </div>

      <ol className="usecase-animate divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
        {SCENARIOS.map((scenario) => (
          <li
            key={scenario.title}
            className="grid gap-3 px-5 py-6 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-8"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <div>
              <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                {scenario.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{scenario.setup}</p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              {scenario.action}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
