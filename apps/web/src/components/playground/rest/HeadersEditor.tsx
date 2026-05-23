"use client";

import { nanoid } from "nanoid";
import { Accordion } from "@/components/playground/shared/Accordion";
import { Tooltip } from "@/components/playground/shared/Tooltip";

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

  const filledCount = rows.filter((r) => r.key.trim()).length;

  return (
    <Accordion title="Headers" defaultOpen badge={filledCount > 0 ? filledCount : undefined}>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex min-w-0 flex-wrap gap-2">
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
            <Tooltip label="Remove header">
              <button
                type="button"
                aria-label="Remove header row"
                onClick={() => removeRow(row.id)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </Tooltip>
          </div>
        ))}
        <Tooltip label="Add header">
          <button
            type="button"
            aria-label="Add header"
            onClick={addRow}
            className="mt-1 flex items-center justify-center self-start rounded-lg border border-dashed border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </Tooltip>
      </div>
    </Accordion>
  );
}
