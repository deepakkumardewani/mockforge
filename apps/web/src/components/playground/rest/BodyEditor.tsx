"use client";

import { useEffect } from "react";

export interface BodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
}

function isJsonValid(body: string): boolean {
  const trimmed = body.trim();
  if (trimmed.length === 0) return true;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function BodyEditor({ value, onChange, onValidityChange }: BodyEditorProps) {
  const valid = isJsonValid(value);

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, value, onValidityChange]);

  const handleFormat = () => {
    if (!value.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch {
      // Silently ignore parse errors — user will see validation message
    }
  };

  return (
    <section
      className="flex min-h-0 flex-1 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="Request body"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Body</h3>
        <button
          onClick={handleFormat}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:opacity-80 active:opacity-70"
          aria-label="Format JSON"
          type="button"
        >
          Format
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        spellCheck={false}
        aria-label="JSON request body"
        placeholder="{ }"
        className="min-h-0 flex-1 w-full resize-none rounded-lg bg-[var(--color-surface)] p-3 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2"
      />
      {!valid ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-accent)]" role="alert">
          Invalid JSON — fix syntax or clear the body before sending.
        </p>
      ) : null}
    </section>
  );
}
