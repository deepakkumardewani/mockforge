"use client";

import { useEffect } from "react";

export interface VariablesEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
}

function isJsonValid(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return true;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function VariablesEditor({ value, onChange, onValidityChange }: VariablesEditorProps) {
  const valid = isJsonValid(value);

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, value, onValidityChange]);

  return (
    <section
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="GraphQL variables"
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Variables</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        spellCheck={false}
        aria-label="GraphQL variables JSON"
        placeholder="{ }"
        className="min-h-32 w-full resize-y rounded-lg bg-[var(--color-surface)] p-3
          font-mono text-sm text-[var(--color-text-primary)] outline-none
          ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]
          focus-visible:ring-2"
      />
      {!valid ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-accent)]" role="alert">
          Invalid JSON — fix syntax or clear variables before sending.
        </p>
      ) : null}
    </section>
  );
}
