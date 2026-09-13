"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { WsConsoleEvent } from "@/hooks/use-ws-console";
import { resolveEventKind, type EventKind } from "@/components/playground/hooks/bounded-events";
import { JsonView } from "@/components/playground/shared/JsonView";

const BOTTOM_EPS_PX = 48;
const PREVIEW_MAX_CHARS = 96;
const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-raised)]";
const TOOLBAR_BTN = `rounded-md px-2 py-1 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-hover)] ${FOCUS_RING}`;

/** Socket.IO entries are logged as `name(payload)` / `name()`; WS entries never match this shape. */
const SOCKET_EVENT_PATTERN = /^([\w.:-]+)\(([\s\S]*)\)$/;

const KIND_MARKER: Record<EventKind, { label: string; className: string }> = {
  system: { label: "Sys", className: "text-[var(--color-text-muted)]" },
  in: { label: "← In", className: "text-emerald-700 dark:text-emerald-400" },
  out: { label: "→ Out", className: "text-[var(--color-accent)]" },
  error: { label: "Err", className: "text-red-700 dark:text-red-400" },
};

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
  if (!match) return { eventName: null, body: message };
  const [, eventName, payload] = match;
  return { eventName, body: payload };
}

function truncatePreview(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= PREVIEW_MAX_CHARS) return compact;
  return `${compact.slice(0, PREVIEW_MAX_CHARS - 1)}…`;
}

function compactPreview(body: string): string {
  if (!body) return "";
  try {
    const parsed: unknown = JSON.parse(body);
    return truncatePreview(typeof parsed === "string" ? parsed : JSON.stringify(parsed));
  } catch {
    return truncatePreview(body);
  }
}

function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
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
  onCollapseAll,
  onJumpToLatest,
}: {
  count: number;
  isPaused: boolean;
  onClear?: () => void;
  onCollapseAll: () => void;
  onJumpToLatest: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] py-2">
      <div className="flex min-w-0 items-center gap-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">Event log</p>
        <span className="text-[10px] font-semibold tabular-nums text-[var(--color-text-muted)]">
          {count}
        </span>
        {isPaused ? (
          <span className="text-[10px] font-medium text-[var(--color-accent)]">
            Autoscroll paused
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {count > 0 ? (
          <button type="button" onClick={onCollapseAll} className={TOOLBAR_BTN}>
            Collapse all
          </button>
        ) : null}
        {isPaused ? (
          <button type="button" onClick={onJumpToLatest} className={TOOLBAR_BTN}>
            Jump to latest
          </button>
        ) : null}
        {onClear ? (
          <button type="button" onClick={onClear} className={TOOLBAR_BTN}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EventPayload({ body }: { body: string }) {
  const parsed = tryParseJson(body);
  if (parsed !== undefined) {
    return <JsonView value={parsed} maxHeightClassName="max-h-48" />;
  }
  return (
    <pre className="m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[var(--color-code-bg)] p-3 font-mono text-xs leading-relaxed text-[var(--color-code-text)]">
      {body}
    </pre>
  );
}

function EventRow({
  event,
  expanded,
  onToggle,
}: {
  event: WsConsoleEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const kind = resolveEventKind(event);
  const marker = KIND_MARKER[kind];
  const { eventName, body } = parseEntryMessage(event.message);
  const title = eventName ?? (kind === "system" || kind === "error" ? event.message : null);
  const preview = eventName ? compactPreview(body) : title ? "" : compactPreview(event.message);

  return (
    <li className="border-b border-[var(--color-border)]/70 last:border-b-0">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className={`flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--color-surface-hover)] ${FOCUS_RING} rounded-md`}
      >
        <span className={`w-10 shrink-0 font-mono text-[10px] font-semibold ${marker.className}`}>
          {marker.label}
        </span>
        {title ? (
          <span className="shrink-0 font-mono text-[11px] font-medium text-[var(--color-text-primary)]">
            {title}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--color-text-muted)]">
          {preview}
        </span>
        <time
          dateTime={new Date(event.at).toISOString()}
          className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--color-text-muted)]"
        >
          {formatLogTimestamp(event.at)}
        </time>
      </button>
      {expanded ? (
        <div id={panelId} className="px-2 pb-2 pl-9">
          {body || !eventName ? (
            <EventPayload body={body || event.message} />
          ) : (
            <p className="text-[11px] text-[var(--color-text-muted)]">No payload</p>
          )}
        </div>
      ) : null}
    </li>
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
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    if (events.length > lastLengthRef.current && !isPaused) {
      el.scrollTop = el.scrollHeight;
    }
    lastLengthRef.current = events.length;
  }, [events, isPaused]);

  useEffect(() => {
    if (events.length === 0) setExpandedIds(new Set());
  }, [events.length]);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsPaused(distanceFromBottom > BOTTOM_EPS_PX);
  }

  function jumpToLatest() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setIsPaused(false);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-[10rem] min-w-0 flex-col overflow-hidden border-t border-[var(--color-border)]">
      <EventLogToolbar
        count={events.length}
        isPaused={isPaused}
        onClear={onClear}
        onCollapseAll={() => setExpandedIds(new Set())}
        onJumpToLatest={jumpToLatest}
      />
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        role="log"
        aria-live="off"
        aria-label="Event log"
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] px-1.5 py-1"
      >
        {events.length === 0 ? (
          <p className="px-2 py-2 text-sm text-[var(--color-text-muted)]">{emptyHint}</p>
        ) : (
          <ul className="flex flex-col">
            {events.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                expanded={expandedIds.has(event.id)}
                onToggle={() => toggleExpanded(event.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
