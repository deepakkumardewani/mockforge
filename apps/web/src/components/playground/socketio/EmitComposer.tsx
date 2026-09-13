"use client";

import { CodeEditor } from "@/components/playground/shared/CodeEditor";

const SEND_SHORTCUT_HINT = "⌘↵";

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
    <div className="flex min-h-0 flex-1 flex-col gap-2">
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
      <CodeEditor
        value={payloadJson}
        onChange={onPayloadChange}
        language="json"
        ariaLabel="Payload (JSON, optional)"
        placeholder="{}"
        onSubmit={canSubmit ? onEmit : undefined}
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
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-on-accent)] outline-none transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Emit
          <span className="text-xs opacity-70" aria-hidden>
            {SEND_SHORTCUT_HINT}
          </span>
        </button>
      </div>
    </div>
  );
}
