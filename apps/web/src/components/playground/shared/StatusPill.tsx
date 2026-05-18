function connectionTone(
  state: "idle" | "connecting" | "connected" | "error",
): { className: string; text: string } {
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
  if (code >= 200 && code < 300) {
    return (
      "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 " +
      "dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-300"
    );
  }
  if (code >= 400 && code < 500) {
    return (
      "border-[var(--color-accent)]/50 bg-[var(--color-accent-glow)] text-[var(--color-accent)]"
    );
  }
  if (code >= 500 || code === 0) {
    return (
      "border-red-600/40 bg-red-600/10 text-red-700 dark:border-red-500/35 dark:bg-red-500/12 dark:text-red-400"
    );
  }
  /* 1xx, 3xx — neutral */
  return (
    "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
  );
}

export interface StatusPillProps {
  /** When provided, renders HTTP-status styling for this code (2xx green, 4xx amber accent, 5xx red). */
  httpStatus?: number;
  connectionState?: "idle" | "connecting" | "connected" | "error";
}

export function StatusPill({
  httpStatus,
  connectionState = "idle",
}: StatusPillProps) {
  if (httpStatus !== undefined) {
    return (
      <span
        className={`inline-flex min-h-7 shrink-0 items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold tracking-tight ${httpTone(httpStatus)}`}
      >
        {httpStatus}
      </span>
    );
  }

  const { className: toneClass, text } = connectionTone(connectionState);

  return (
    <span
      className={`inline-flex min-h-7 shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass}`}
    >
      {text}
    </span>
  );
}
