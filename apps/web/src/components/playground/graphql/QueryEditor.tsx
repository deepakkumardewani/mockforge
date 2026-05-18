"use client";

export interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function QueryEditor({ value, onChange }: QueryEditorProps) {
  return (
    <section
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="GraphQL query"
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Query</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        spellCheck={false}
        aria-label="GraphQL query"
        placeholder="query { ... }"
        className="min-h-64 w-full resize-y rounded-lg bg-[var(--color-surface)] p-3
          font-mono text-sm text-[var(--color-text-primary)] outline-none
          ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]
          focus-visible:ring-2"
      />
    </section>
  );
}
