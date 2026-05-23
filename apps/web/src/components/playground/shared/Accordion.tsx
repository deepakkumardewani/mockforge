"use client";

import { useState } from "react";

export interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  badge?: string | number;
  children: React.ReactNode;
}

export function Accordion({ title, defaultOpen = false, badge, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
          {badge !== undefined && (
            <span className="rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-xs font-medium text-white">
              {badge}
            </span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-[var(--color-text-muted)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="border-t border-[var(--color-border)] px-4 py-3">{children}</div>}
    </div>
  );
}
