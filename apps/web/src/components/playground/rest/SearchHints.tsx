"use client";

import { useMemo } from "react";
import {
  getEntityFromPath,
  SEARCH_FIELDS,
} from "@/components/playground/shared/playground-catalogue";

interface ParamHint {
  /** Query param key, used for dedupe */
  key: string;
  /** Value appended on click */
  value: string;
  /** Label shown on the chip */
  label: string;
}

const PARAM_HINTS: readonly ParamHint[] = [
  { key: "q", value: "searchterm", label: "q=searchterm" },
  { key: "limit", value: "30", label: "limit=30" },
  { key: "skip", value: "0", label: "skip=0" },
  { key: "order", value: "asc", label: "order=asc|desc" },
];

export interface SearchHintsProps {
  /** Current request URL (may already contain a query string) */
  url: string;
  /** Appends a single param; caller is responsible for dedupe semantics */
  onAppendParam: (key: string, value: string) => void;
}

export function SearchHints({ url, onAppendParam }: SearchHintsProps) {
  const entity = getEntityFromPath(url);

  const existingKeys = useMemo(() => {
    const queryStr = url.split("?")[1] ?? "";
    return new Set(new URLSearchParams(queryStr).keys());
  }, [url]);

  const fields = entity ? SEARCH_FIELDS[entity] : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs text-[var(--color-text-muted)]">Query params:</span>
        {PARAM_HINTS.map((hint) => {
          const added = existingKeys.has(hint.key);
          return (
            <button
              key={hint.key}
              type="button"
              disabled={added}
              onClick={() => onAppendParam(hint.key, hint.value)}
              title={added ? `${hint.key} already added` : `Append ${hint.key} to URL`}
              className={`rounded-md border px-2 py-0.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                added
                  ? "cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50"
                  : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {hint.label}
            </button>
          );
        })}
      </div>
      {fields ? (
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          Searchable fields:{" "}
          <span className="text-[var(--color-text-primary)]">{fields.join(", ")}</span>
        </p>
      ) : null}
    </div>
  );
}
