"use client";

import { nanoid } from "nanoid";

export type HeaderRow = {
  id: string;
  key: string;
  value: string;
};

export function createEmptyHeaderRow(): HeaderRow {
  return { id: nanoid(), key: "", value: "" };
}

export interface HeadersEditorProps {
  rows: HeaderRow[];
  onChange: (rows: HeaderRow[]) => void;
}

export function HeadersEditor({ rows, onChange }: HeadersEditorProps) {
  function updateRow(id: string, patch: Partial<Pick<HeaderRow, "key" | "value">>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChange([...rows, createEmptyHeaderRow()]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) {
      onChange([createEmptyHeaderRow()]);
      return;
    }
    onChange(rows.filter((r) => r.id !== id));
  }

  return (
    <section
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="Request headers"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Headers</h3>
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          Add header
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap gap-2">
            <input
              value={row.key}
              onChange={(e) => updateRow(row.id, { key: e.target.value })}
              placeholder="Key"
              aria-label="Header key"
              className="min-w-[6rem] flex-1 rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2"
            />
            <input
              value={row.value}
              onChange={(e) => updateRow(row.id, { value: e.target.value })}
              placeholder="Value"
              aria-label={`Value for header ${row.key || "blank"}`}
              className="min-w-[6rem] flex-1 rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2"
            />
            <button
              type="button"
              aria-label="Remove header row"
              onClick={() => removeRow(row.id)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
