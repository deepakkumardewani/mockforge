"use client";

import type { HttpMethod } from "@/components/playground/shared/presets";
import { EndpointAutocomplete } from "@/components/playground/rest/EndpointAutocomplete";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

const API_PREFIX = "/api/";

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

  // The autocomplete works with the path suffix (without /api/ prefix).
  // The full URL stored externally may include /api/ or not — normalise both ways.
  const suffix = url.startsWith(API_PREFIX) ? url.slice(API_PREFIX.length) : url;

  function handleSuffixChange(newSuffix: string) {
    onUrlChange(API_PREFIX + newSuffix);
  }

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

      <EndpointAutocomplete
        value={suffix}
        onChange={handleSuffixChange}
        onMethodChange={onMethodChange}
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
