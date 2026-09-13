import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Playground", href: "/playground" },
  { label: "Documentation", href: "/docs" },
  { label: "Schema Builder", href: "/builder" },
] as const;

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
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-text-primary)]">
              A hosted mock API you call from your app. REST, GraphQL, WebSocket, and Socket.io from
              one schema.
            </p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              Product
            </p>
            <nav className="flex flex-col gap-2.5" aria-label="Footer">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--color-text-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col justify-between sm:items-end sm:text-right">
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
              Point your client at the public API. Playground is only for testing and exploration.
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
