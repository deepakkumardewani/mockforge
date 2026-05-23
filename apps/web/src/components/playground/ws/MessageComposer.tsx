"use client";

export interface MessageComposerProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSend: () => void;
  readonly canSend: boolean;
}

export function MessageComposer({ value, onChange, onSend, canSend }: MessageComposerProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
      <label
        className="text-xs font-medium text-[var(--color-text-muted)]"
        htmlFor="ws-message-body"
      >
        Message
      </label>
      <textarea
        id="ws-message-body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder='e.g. {"type":"ping"}'
        className="min-h-0 flex-1 resize-none rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSend}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend || value.trim().length === 0}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-on-accent)] outline-none transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
