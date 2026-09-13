"use client";

import { CodeEditor } from "@/components/playground/shared/CodeEditor";

const SEND_SHORTCUT_HINT = "⌘↵";

export interface MessageComposerProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSend: () => void;
  readonly canSend: boolean;
}

export function MessageComposer({ value, onChange, onSend, canSend }: MessageComposerProps) {
  const canSubmit = canSend && value.trim().length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <CodeEditor
        value={value}
        onChange={onChange}
        language="json"
        ariaLabel="Message"
        placeholder='e.g. {"type":"ping"}'
        onSubmit={canSubmit ? onSend : undefined}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSend}
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-on-accent)] outline-none transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
          <span className="text-xs opacity-70" aria-hidden>
            {SEND_SHORTCUT_HINT}
          </span>
        </button>
      </div>
    </div>
  );
}
