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
  return `[${hh}:${mm}:${ss}.${ms}]`;
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
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <div className="border-b border-[var(--color-border)] px-3 py-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">Event log</p>
      </div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="max-h-[min(24rem,50vh)] min-h-[12rem] overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed text-[var(--color-text-primary)]"
      >
        {events.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">{emptyHint}</p>
        ) : (
          <ul className="space-y-1">
            {events.map((e) => (
              <li key={e.id} className="whitespace-pre-wrap break-all">
                <span className="text-[var(--color-text-muted)]">{formatLogTimestamp(e.at)}</span>{" "}
                <span className="text-[var(--color-accent)]">{e.direction === "in" ? "←" : "→"}</span>{" "}
                {e.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
