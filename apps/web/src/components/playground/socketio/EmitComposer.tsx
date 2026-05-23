"use client";

export interface EmitComposerProps {
  readonly eventName: string;
  readonly payloadJson: string;
  readonly canEmit: boolean;
  readonly emitError: string | null;
  readonly onEventNameChange: (value: string) => void;
  readonly onPayloadChange: (value: string) => void;
  readonly onEmit: () => void;
}

export function EmitComposer({
  eventName,
  payloadJson,
  canEmit,
  emitError,
  onEventNameChange,
  onPayloadChange,
  onEmit,
}: EmitComposerProps) {
  const trimmedEvent = eventName.trim();
  const canSubmit = canEmit && trimmedEvent.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
      <label
        className="text-xs font-medium text-[var(--color-text-muted)]"
        htmlFor="sio-emit-event"
      >
        Emit event name
      </label>
      <input
        id="sio-emit-event"
        type="text"
        value={eventName}
        onChange={(e) => onEventNameChange(e.target.value)}
        disabled={!canEmit}
        autoComplete="off"
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        placeholder="e.g. subscribe"
      />
      <label
        className="text-xs font-medium text-[var(--color-text-muted)]"
        htmlFor="sio-emit-payload"
      >
        Payload (JSON, optional)
      </label>
      <textarea
        id="sio-emit-payload"
        value={payloadJson}
        onChange={(e) => onPayloadChange(e.target.value)}
        disabled={!canEmit}
        rows={1}
        placeholder="{}"
        className="min-h-0 flex-1 resize-none rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {emitError ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {emitError}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onEmit}
          disabled={!canSubmit}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-on-accent)] outline-none transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Emit
        </button>
      </div>
    </div>
  );
}
