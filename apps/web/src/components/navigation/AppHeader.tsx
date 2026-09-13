"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/navigation/BrandLogo";
import { APP_NAV_LINKS, HOME_HREF, isAppNavActive } from "@/lib/nav-links";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

const NAV_LINK_CLASS = `landing-nav-link inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-medium ${FOCUS_RING}`;

const GHOST_ICON_CLASS =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--color-text-nav)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function useMobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return { open, setOpen };
}

export function AppHeader() {
  const pathname = usePathname();
  const { open, setOpen } = useMobileMenu();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="app-header-bar" aria-label="Primary navigation">
        <div className="app-header-cluster">
          <BrandLink />
          <DesktopNav pathname={pathname} />
        </div>
        <div className="app-header-actions">
          <GitHubComingSoon />
          <ThemeToggle className={GHOST_ICON_CLASS} />
          <button
            type="button"
            className={`app-header-mobile-only min-h-11 min-w-11 items-center justify-center rounded-sm text-[var(--color-text-nav)] transition-colors hover:text-[var(--color-text-primary)] ${FOCUS_RING}`}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>
      {open ? <MobileMenu pathname={pathname} onNavigate={() => setOpen(false)} /> : null}
    </header>
  );
}

function BrandLink() {
  return (
    <Link
      href={HOME_HREF}
      className={`flex shrink-0 items-center gap-2.5 rounded-sm text-[var(--color-text-primary)] ${FOCUS_RING}`}
    >
      <BrandLogo className="app-header-mark" />
      <span className="app-header-wordmark">MockForge</span>
    </Link>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <ul className="app-header-desktop-links" role="list">
      {APP_NAV_LINKS.map((link) => {
        const current = isAppNavActive(pathname, link.href, link.match);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={NAV_LINK_CLASS}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MobileMenu({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <div id="mobile-menu" className="app-header-mobile-drawer landing-nav-drawer py-4">
      <ul role="list" className="flex flex-col">
        {APP_NAV_LINKS.map((link) => {
          const current = isAppNavActive(pathname, link.href, link.match);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`landing-nav-link flex min-h-11 items-center rounded-sm px-1 text-sm font-medium ${FOCUS_RING}`}
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GitHubComingSoon() {
  return (
    <span className={`${GHOST_ICON_CLASS} cursor-default`} title="GitHub — coming soon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
      <span className="sr-only">GitHub — coming soon</span>
    </span>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      {open ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        />
      ) : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        />
      )}
    </svg>
  );
}
