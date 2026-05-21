"use client";

export type GraphqlRequestBarProps = {
  endpointUrl: string;
  onSend: () => void;
  isLoading: boolean;
  canSend?: boolean;
  schemaOpen?: boolean;
  onToggleSchema?: () => void;
};

export function GraphqlRequestBar({
  endpointUrl,
  onSend,
  isLoading,
  canSend = true,
  schemaOpen = false,
  onToggleSchema,
}: GraphqlRequestBarProps) {
  const sendDisabled = isLoading || !canSend;

  return (
    <div className="flex flex-wrap items-stretch gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2">
      <select
        value="POST"
        disabled
        aria-label="HTTP method"
        title="GraphQL requests use POST"
        className="min-w-[6rem] cursor-not-allowed rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-muted)] outline-none opacity-90"
      >
        <option value="POST">POST</option>
      </select>
      <input
        readOnly
        value={endpointUrl}
        aria-label="GraphQL endpoint URL"
        title="GraphQL HTTP endpoint"
        className="min-w-0 flex-1 cursor-default rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] focus-visible:ring-2 sm:min-w-[12rem]"
      />
      {onToggleSchema && (
        <button
          type="button"
          onClick={onToggleSchema}
          aria-pressed={schemaOpen}
          aria-label="Toggle schema panel"
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
            schemaOpen
              ? "border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          }`}
        >
          Schema
        </button>
      )}
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
