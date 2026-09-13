export type ConnectionState = "idle" | "connecting" | "connected" | "error";

const HTTP_STATUS_SUCCESS_MIN = 200;
const HTTP_STATUS_SUCCESS_MAX = 300;
const HTTP_STATUS_CLIENT_ERROR_MIN = 400;
const HTTP_STATUS_CLIENT_ERROR_MAX = 500;
const HTTP_STATUS_SERVER_ERROR_MIN = 500;
const HTTP_STATUS_NETWORK_FAILURE = 0;

const PILL_BASE_CLASSES =
  "inline-flex min-h-7 shrink-0 items-center rounded-full border px-2.5 py-0.5";

function connectionTone(state: ConnectionState): { className: string; text: string } {
  switch (state) {
    case "idle":
      return {
        className:
          "border-[var(--color-border)] bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]",
        text: "Idle",
      };
    case "connecting":
      return {
        className:
          "border-[var(--color-accent)]/40 bg-[var(--color-accent-glow)] text-[var(--color-accent)]",
        text: "Connecting…",
      };
    case "connected":
      return {
        className:
          "border-emerald-600/35 bg-emerald-600/10 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-300",
        text: "Connected",
      };
    case "error":
      return {
        className:
          "border-red-600/35 bg-red-600/10 text-red-700 dark:border-red-500/35 dark:bg-red-500/12 dark:text-red-400",
        text: "Error",
      };
  }
}

function httpTone(code: number): string {
  if (code >= HTTP_STATUS_SUCCESS_MIN && code < HTTP_STATUS_SUCCESS_MAX) {
    return (
      "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 " +
      "dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-300"
    );
  }
  if (code >= HTTP_STATUS_CLIENT_ERROR_MIN && code < HTTP_STATUS_CLIENT_ERROR_MAX) {
    return "border-[var(--color-accent)]/50 bg-[var(--color-accent-glow)] text-[var(--color-accent)]";
  }
  if (code >= HTTP_STATUS_SERVER_ERROR_MIN || code === HTTP_STATUS_NETWORK_FAILURE) {
    return "border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/35 dark:bg-red-500/12 dark:text-red-400";
  }
  /* 1xx, 3xx — neutral */
  return "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]";
}

export interface HttpStatusPillProps {
  readonly httpStatus: number;
}

/** Colored pill for an HTTP response status code (2xx green, 4xx amber accent, 5xx/0 red). */
export function HttpStatusPill({ httpStatus }: HttpStatusPillProps) {
  return (
    <span
      className={`${PILL_BASE_CLASSES} font-mono text-xs font-semibold tracking-tight ${httpTone(httpStatus)}`}
    >
      {httpStatus}
    </span>
  );
}

export interface ConnectionStatusPillProps {
  readonly state: ConnectionState;
}

/** Colored pill for a live-connection lifecycle state (WS / Socket.IO). */
export function ConnectionStatusPill({ state }: ConnectionStatusPillProps) {
  const { className: toneClass, text } = connectionTone(state);
  return <span className={`${PILL_BASE_CLASSES} text-xs font-medium ${toneClass}`}>{text}</span>;
}

const LIVE_DOT: Record<ConnectionState, { readonly dot: string; readonly label: string }> = {
  idle: { dot: "bg-[var(--color-text-muted)]", label: "Offline" },
  connecting: { dot: "bg-[var(--color-accent)]/45", label: "Connecting" },
  connected: { dot: "bg-[var(--color-accent)] animate-pulse", label: "Live" },
  error: { dot: "bg-red-500", label: "Error" },
};

/** Compact connection indicator for playground bars (dot + label, no pill chrome). */
export function ConnectionLiveDot({ state }: { readonly state: ConnectionState }) {
  const { dot, label } = LIVE_DOT[state];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

/**
 * @deprecated Use `HttpStatusPill` or `ConnectionStatusPill` directly. Kept for
 * callers outside this phase's scope (e.g. `components/landing/LiveDemo.tsx`).
 */
export interface StatusPillProps {
  httpStatus?: number;
  connectionState?: ConnectionState;
}

export function StatusPill({ httpStatus, connectionState = "idle" }: StatusPillProps) {
  if (httpStatus !== undefined) return <HttpStatusPill httpStatus={httpStatus} />;
  return <ConnectionStatusPill state={connectionState} />;
}
