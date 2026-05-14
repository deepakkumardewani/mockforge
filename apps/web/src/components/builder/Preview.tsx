"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useMfIdStore } from "@/store/mf-id";
import type { BuilderFormValues, SchemaFieldForApi } from "./types";

interface Props {
  formValues: BuilderFormValues;
}

interface PreviewResult {
  loading: boolean;
  error: string | null;
  records: Record<string, unknown>[];
}

function buildApiBody(values: BuilderFormValues): object {
  return {
    name: values.name || "Untitled",
    fields: values.fields
      .filter((f) => f.name.trim().length > 0)
      .map((f) => {
        const field: SchemaFieldForApi = {
          name: f.name.trim(),
          type: f.type,
        };
        if (f.type === "enum" && f.values) {
          field.values = f.values
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (f.type === "array" && f.items) {
          field.items = f.items;
        }
        if (f.type === "number") {
          if (f.min !== undefined && !isNaN(f.min)) field.min = f.min;
          if (f.max !== undefined && !isNaN(f.max)) field.max = f.max;
        }
        return field;
      }),
    persistent: false,
  };
}

export function Preview({ formValues }: Props) {
  const mfId = useMfIdStore((s) => s.mfId);
  const [result, setResult] = useState<PreviewResult>({
    loading: false,
    error: null,
    records: [],
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugRef = useRef<string | null>(null);

  const fetchPreview = useCallback(async () => {
    const validFields = formValues.fields.filter((f) => f.name.trim().length > 0);
    if (validFields.length === 0) {
      setResult({ loading: false, error: null, records: [] });
      return;
    }

    setResult((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const body = buildApiBody(formValues);
      const { slug } = await apiClient<{ slug: string; endpoint: string }>(
        "/api/schemas",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        mfId,
      );
      slugRef.current = slug;

      const data = await apiClient<{ data: Record<string, unknown>[] }>(
        `/api/custom/${slug}?limit=3`,
        {},
        mfId,
      );
      setResult({ loading: false, error: null, records: data.data });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Preview generation failed";
      setResult({ loading: false, error: message, records: [] });
    }
  }, [formValues, mfId]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      fetchPreview();
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchPreview]);

  if (formValues.fields.every((f) => !f.name.trim())) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Add at least one field to see a live preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Live Preview</h3>

      {result.loading && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            Generating preview...
          </div>
        </div>
      )}

      {result.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
        </div>
      )}

      {!result.loading && !result.error && result.records.length > 0 && (
        <div className="space-y-2">
          {result.records.map((record, i) => (
            <pre
              key={i}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] p-3 text-xs text-[var(--color-code-text)] overflow-x-auto"
            >
              {JSON.stringify(record, null, 2)}
            </pre>
          ))}
        </div>
      )}

      {!result.loading && !result.error && result.records.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">No preview data available</p>
        </div>
      )}
    </div>
  );
}
