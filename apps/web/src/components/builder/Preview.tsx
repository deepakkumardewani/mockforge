"use client";

import { useMemo } from "react";
import { generatePreviewRecords } from "./schema-convert";
import type { BuilderFormValues } from "./types";

interface Props {
  formValues: BuilderFormValues;
}

export function Preview({ formValues }: Props) {
  const records = useMemo(() => generatePreviewRecords(formValues), [formValues]);
  const hasNamedField = formValues.fields.some((field) => field.name.trim().length > 0);

  if (!hasNamedField) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
          02 · Preview
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-[var(--color-text-primary)]">
          Generated response
        </h2>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Your sample response will appear here
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Name the first field to start generating records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
            02 · Preview
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[var(--color-text-primary)]">
            Generated response
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {records.length} sample {records.length === 1 ? "record" : "records"}
        </p>
      </div>

      {records.length > 0 ? (
        <pre
          className="mt-6 max-h-144 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] p-4 text-xs leading-relaxed text-[var(--color-code-text)]"
          aria-live="polite"
        >
          {JSON.stringify(records, null, 2)}
        </pre>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">No preview data available</p>
        </div>
      )}
    </div>
  );
}
