"use client";

import type { HttpMethod } from "@/components/playground/shared/presets";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

export interface MethodUrlBarProps {
  method: HttpMethod;
  url: string;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  isLoading: boolean;
  /** When false, disables Send without affecting loading spinner text */
  canSend?: boolean;
}

export function MethodUrlBar({
  method,
  url,
  onMethodChange,
  onUrlChange,
  onSend,
  isLoading,
  canSend = true,
}: MethodUrlBarProps) {
  const sendDisabled = isLoading || !canSend;

  return (
    <div className="flex flex-wrap items-stretch gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        aria-label="HTTP method"
        className="min-w-[6rem] rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] focus-visible:ring-2"
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="/api/users"
        aria-label="Request URL"
        className="min-w-0 flex-1 rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 sm:min-w-[12rem]"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={sendDisabled}
        className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        {isLoading ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
