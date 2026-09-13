"use client";

import type { HttpMethod } from "@/components/playground/shared/presets";
import { EndpointAutocomplete } from "@/components/playground/rest/EndpointAutocomplete";
import { REST_API_PREFIX as API_PREFIX } from "@/lib/playground-constants";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];
const SEND_SHORTCUT_HINT = "⌘↵";

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
    <div className="flex items-stretch gap-2">
      <div
        data-url-field
        className="relative flex min-w-0 flex-1 items-stretch rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-accent)]"
      >
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
          aria-label="HTTP method"
          className="w-auto min-w-0 shrink-0 appearance-auto border-r border-[var(--color-border)] bg-transparent px-2.5 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none"
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
      </div>

      <button
        type="button"
        onClick={onSend}
        disabled={sendDisabled}
        className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        {isLoading ? "Sending…" : "Send"}
        {!isLoading ? (
          <span className="text-xs opacity-70" aria-hidden>
            {SEND_SHORTCUT_HINT}
          </span>
        ) : null}
      </button>
    </div>
  );
}
