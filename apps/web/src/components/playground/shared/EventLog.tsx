"use client";

import { useEffect, useRef, useState } from "react";
import type { WsConsoleEvent } from "@/hooks/use-ws-console";
import { formatJson } from "@/components/playground/shared/json";

const BOTTOM_EPS_PX = 48;

/** Socket.IO entries are logged as `name(payload)` / `name()`; WS entries never match this shape. */
const SOCKET_EVENT_PATTERN = /^([\w.:-]+)\(([\s\S]*)\)$/;

function formatLogTimestamp(at: number): string {
  const d = new Date(at);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

interface ParsedEntry {
  readonly eventName: string | null;
  readonly body: string;
}

function parseEntryMessage(message: string): ParsedEntry {
  const match = message.match(SOCKET_EVENT_PATTERN);
  // Plain WS frames carry the payload directly; pretty-print them too so JSON
  // frames are readable rather than one long line.
  if (!match) return { eventName: null, body: formatJson(message) };
  const [, eventName, payload] = match;
  return { eventName, body: payload.length > 0 ? formatJson(payload) : "" };
}

export interface EventLogProps {
  readonly events: readonly WsConsoleEvent[];
  readonly emptyHint?: string;
  /** Clears the log; the toolbar's Clear button hides itself when this isn't wired. */
  readonly onClear?: () => void;
}

function EventLogToolbar({
  count,
  isPaused,
  onClear,
}: {
  count: number;
  isPaused: boolean;
  onClear?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">Event log</p>
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--color-text-muted)]">
          {count}
        </span>
        {isPaused ? (
          <span className="text-[10px] font-medium text-[var(--color-accent)]">
            Autoscroll paused
          </span>
        ) : null}
      </div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-text-primary)] outline-none transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

function EventEntryBody({ message }: { message: string }) {
  const { eventName, body } = parseEntryMessage(message);

  if (eventName === null) {
    return (
      <pre className="m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-xs leading-relaxed text-[var(--color-text-primary)]">
        {body}
      </pre>
    );
  }

  return (
    <div className="px-3 py-2.5">
      <span className="mb-1.5 inline-flex items-center rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent-glow)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-accent)]">
        {eventName}
      </span>
      {body ? (
        <pre className="m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--color-text-primary)]">
          {body}
        </pre>
      ) : null}
    </div>
  );
}

export function EventLog({
  events,
  emptyHint = "Connect to see messages.",
  onClear,
}: EventLogProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const lastLengthRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    if (events.length > lastLengthRef.current && !isPaused) {
      el.scrollTop = el.scrollHeight;
    }
    lastLengthRef.current = events.length;
  }, [events, isPaused]);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsPaused(distanceFromBottom > BOTTOM_EPS_PX);
  }

  return (
    <div className="flex h-full min-h-[12rem] min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <EventLogToolbar count={events.length} isPaused={isPaused} onClear={onClear} />
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
                    <EventEntryBody message={e.message} />
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
