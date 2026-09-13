"use client";

import { PanelRight } from "lucide-react";
import { Tooltip } from "@/components/playground/shared/Tooltip";

export type GraphqlRequestBarProps = {
  endpointUrl: string;
  onSend: () => void;
  isLoading: boolean;
  canSend?: boolean;
  schemaOpen: boolean;
  onToggleSchema: () => void;
};

const SEND_SHORTCUT_HINT = "⌘↵";

export function GraphqlRequestBar({
  endpointUrl,
  onSend,
  isLoading,
  canSend = true,
  schemaOpen,
  onToggleSchema,
}: GraphqlRequestBarProps) {
  const sendDisabled = isLoading || !canSend;

  return (
    <div className="flex items-stretch gap-2">
      <div className="relative flex min-w-0 flex-1 items-stretch rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-accent)]">
        <span
          aria-hidden="true"
          className="flex items-center border-r border-[var(--color-border)] px-2.5 py-2 font-mono text-sm text-[var(--color-text-muted)] select-none"
        >
          POST
        </span>
        <input
          readOnly
          value={endpointUrl}
          aria-label="GraphQL endpoint URL"
          title="GraphQL HTTP endpoint"
          className="min-w-0 flex-1 cursor-default bg-transparent px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] caret-[var(--color-accent)] outline-none"
        />
      </div>
      <Tooltip label="Schema">
        <button
          type="button"
          onClick={onToggleSchema}
          aria-pressed={schemaOpen}
          aria-label="Toggle schema sidebar"
          className={`flex shrink-0 items-center justify-center rounded-lg border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
            schemaOpen
              ? "border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
          }`}
        >
          <PanelRight size={16} aria-hidden />
        </button>
      </Tooltip>
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
