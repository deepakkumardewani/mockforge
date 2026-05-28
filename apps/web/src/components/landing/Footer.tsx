import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="h-px w-full" style={{ background: "var(--color-accent)" }} />

      <div
        className="px-6 py-16 sm:px-10 lg:px-16"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-3 sm:gap-10">
          <div>
            <span
              className="font-display text-xl font-black tracking-tight"
              style={{ color: "var(--color-accent)" }}
            >
              MockForge
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              Unified fake data API for developers who prototype against real-shaped endpoints.
            </p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              Links
            </p>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/docs"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Documentation
              </Link>
              <a
                href="https://github.com/mockforge/mockforge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                GitHub
              </a>
              <Link
                href="/builder"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Schema Builder
              </Link>
              <Link
                href="/playground"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Playground
              </Link>
            </nav>
          </div>

          <div className="flex flex-col justify-between sm:items-end sm:text-right">
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
              No tracking. No ads. No nonsense.
            </p>
            <p className="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
              &copy; {new Date().getFullYear()} MockForge
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
