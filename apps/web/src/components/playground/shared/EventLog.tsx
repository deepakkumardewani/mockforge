"use client";

import { useEffect, useRef } from "react";
import type { WsConsoleEvent } from "@/hooks/use-ws-console";

const BOTTOM_EPS_PX = 48;

function formatLogTimestamp(at: number): string {
  const d = new Date(at);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

export interface EventLogProps {
  readonly events: readonly WsConsoleEvent[];
  readonly emptyHint?: string;
}

export function EventLog({ events, emptyHint = "Connect to see messages." }: EventLogProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const pinnedToBottomRef = useRef(true);
  const lastLengthRef = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    if (events.length > lastLengthRef.current && pinnedToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    lastLengthRef.current = events.length;
  }, [events]);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedToBottomRef.current = distanceFromBottom <= BOTTOM_EPS_PX;
  }

  return (
    <div className="flex h-full min-h-[12rem] min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <div className="shrink-0 border-b border-[var(--color-border)] px-3 py-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">Event log</p>
      </div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto [scrollbar-gutter:stable] px-3 py-3"
      >
        {events.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">{emptyHint}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((e) => {
              const isIn = e.direction === "in";
              return (
                <li key={e.id}>
                  <article
                    className={
                      isIn
                        ? "rounded-lg border border-emerald-600/25 bg-emerald-600/[0.06] shadow-sm dark:border-emerald-500/25 dark:bg-emerald-500/[0.08]"
                        : "rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-glow)] shadow-sm"
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)]/60 px-3 py-2">
                      <time
                        dateTime={new Date(e.at).toISOString()}
                        className="font-mono text-[10px] tabular-nums text-[var(--color-text-muted)]"
                      >
                        {formatLogTimestamp(e.at)}
                      </time>
                      <span
                        className={
                          isIn
                            ? "rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200"
                            : "rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]"
                        }
                      >
                        {isIn ? "← In" : "→ Out"}
                      </span>
                    </div>
                    <pre className="m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-xs leading-relaxed text-[var(--color-text-primary)]">
                      {e.message}
                    </pre>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
