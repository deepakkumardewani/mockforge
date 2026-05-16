import Link from "next/link";

export function Footer() {
  return (
    <footer>
      {/* Full-width amber accent top rule */}
      <div className="h-px w-full" style={{ background: "var(--color-accent)" }} />

      <div
        className="px-6 py-14 sm:px-10 lg:px-16"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-3">
          {/* Col 1 — brand */}
          <div>
            <span
              className="font-display text-xl font-black tracking-tight"
              style={{ color: "var(--color-accent)" }}
            >
              MockForge
            </span>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              Unified fake data API for developers who build fast.
            </p>
          </div>

          {/* Col 2 — navigation */}
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              Links
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                href="/docs"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                Documentation
              </Link>
              <a
                href="https://github.com/mockforge/mockforge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                GitHub
              </a>
              <Link
                href="/builder"
                className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                Schema Builder
              </Link>
            </nav>
          </div>

          {/* Col 3 — tagline + copyright */}
          <div className="flex flex-col justify-between sm:items-end sm:text-right">
            <p className="text-xs text-[var(--color-text-muted)]">
              No tracking. No ads. No nonsense.
            </p>
            <p className="mt-6 text-xs text-[var(--color-text-muted)]">
              &copy; {new Date().getFullYear()} MockForge
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
