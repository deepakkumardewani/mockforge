import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--color-accent)]">MF</span>
          <span className="text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} MockForge
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          <Link
            href="/docs"
            className="transition-colors hover:text-[var(--color-text-primary)]"
          >
            Docs
          </Link>
          <a
            href="https://github.com/mockforge/mockforge"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--color-text-primary)]"
          >
            GitHub
          </a>
          <Link
            href="/builder"
            className="transition-colors hover:text-[var(--color-text-primary)]"
          >
            Schema Builder
          </Link>
        </nav>

        <p className="text-xs text-[var(--color-text-muted)]">
          Built for developers. No tracking, no ads, no nonsense.
        </p>
      </div>
    </footer>
  );
}
