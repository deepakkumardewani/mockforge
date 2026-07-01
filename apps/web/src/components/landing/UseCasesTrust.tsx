"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";

interface UseCase {
  title: string;
  description: string;
}

const USE_CASES: UseCase[] = [
  {
    title: "Frontend development",
    description:
      "Build UI against realistic endpoints while the backend is still in progress — same shapes in dev and staging.",
  },
  {
    title: "Integration & CI testing",
    description:
      "Run your test suite against a live mock server with predictable, typed responses — no flaky hand-rolled stubs.",
  },
  {
    title: "Prototyping",
    description:
      "Spin up a working API in seconds to validate ideas before committing to backend architecture.",
  },
  {
    title: "Demos & presentations",
    description:
      "Show a fully interactive product with real HTTP and WebSocket traffic — no backend team required in the room.",
  },
];

const TRUST_SIGNALS = [
  "Signup-free access",
  "Keyless API",
  "Hosted playground",
  "Real-time WebSocket + Socket.io",
  "Live request counter",
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
          Use cases
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Built for how you actually work
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          From daily frontend work to CI pipelines and live demos — MockForge fits without setup
          overhead.
        </p>
      </div>

      <div className="usecase-animate grid gap-4 sm:grid-cols-2">
        {USE_CASES.map((useCase) => (
          <div
            key={useCase.title}
            className="rounded-xl border border-[var(--color-border)] p-6"
            style={{ background: "var(--color-surface-raised)" }}
          >
            <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
              {useCase.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>

      <div
        className="usecase-animate mt-10 flex flex-wrap gap-2"
        role="list"
        aria-label="Trust signals"
      >
        {TRUST_SIGNALS.map((signal) => (
          <span
            key={signal}
            role="listitem"
            className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-medium text-[var(--color-text-muted)]"
            style={{ background: "var(--color-surface)" }}
          >
            {signal}
          </span>
        ))}
      </div>
    </Section>
  );
}
