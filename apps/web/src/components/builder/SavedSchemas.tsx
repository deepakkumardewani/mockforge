"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useMfIdStore } from "@/store/mf-id";
import { DestructiveIconButton } from "./DestructiveIconButton";
import type { SavedSchema } from "./types";

export interface SavedSchemasProps {
  onLoad: (schema: SavedSchema) => void;
  onNew?: () => void;
  activeSlug: string | null;
  onDeleted?: (slug: string) => void;
}

const ROW_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]";

export function SavedSchemas({ onLoad, onNew, activeSlug, onDeleted }: SavedSchemasProps) {
  const mfId = useMfIdStore((s) => s.mfId);
  const queryClient = useQueryClient();
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  const { data: schemas = [], isLoading } = useQuery({
    queryKey: ["saved-schemas", mfId],
    queryFn: () =>
      apiClient<{ data: SavedSchema[] }>("/api/schemas", {}, mfId).then((res) => res.data),
    enabled: !!mfId,
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) =>
      apiClient<{ deleted: boolean }>(`/api/schemas/${slug}`, { method: "DELETE" }, mfId),
    onSuccess: (_, deletedSlug) => {
      setConfirmSlug(null);
      onDeleted?.(deletedSlug);
      void queryClient.invalidateQueries({ queryKey: ["saved-schemas", mfId] });
    },
  });

  return (
    <section className="space-y-3" aria-labelledby="saved-schemas-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2
            id="saved-schemas-heading"
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            Schemas
          </h2>
          {!isLoading && schemas.length > 0 ? (
            <span className="text-xs text-[var(--color-text-muted)]">{schemas.length}</span>
          ) : null}
        </div>
        {onNew ? (
          <button
            type="button"
            onClick={onNew}
            className="rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)]"
          >
            + New
          </button>
        ) : null}
      </div>

      {isLoading && <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>}

      {!isLoading && schemas.length === 0 && <EmptySavedSchemas />}

      {!isLoading && schemas.length > 0 && (
        <ul className="space-y-1.5">
          {schemas.map((schema) => (
            <SchemaRow
              key={schema.slug}
              schema={schema}
              isActive={activeSlug === schema.slug}
              isConfirming={confirmSlug === schema.slug}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === schema.slug}
              onLoad={() => onLoad(schema)}
              onAskDelete={() => setConfirmSlug(schema.slug)}
              onCancelDelete={() => setConfirmSlug(null)}
              onConfirmDelete={() => deleteMutation.mutate(schema.slug)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptySavedSchemas() {
  return (
    <div className="pt-1">
      <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
        No saved schemas yet.
      </p>
    </div>
  );
}

interface SchemaRowProps {
  schema: SavedSchema;
  isActive: boolean;
  isConfirming: boolean;
  isDeleting: boolean;
  onLoad: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function SchemaRow({
  schema,
  isActive,
  isConfirming,
  isDeleting,
  onLoad,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: SchemaRowProps) {
  const name = schema.definition.name;
  const fieldCount = schema.definition.fields.length;
  const persistence = schema.persistent ? "persistent" : "ephemeral";

  return (
    <li
      className={`rounded-lg border px-3 py-2.5 ${
        isActive
          ? "border-[var(--color-accent)] bg-[var(--color-surface-hover)]"
          : "border-[var(--color-border)] bg-[var(--color-surface-raised)]"
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-x-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onLoad}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Load ${name}`}
            className={`block max-w-full truncate text-left text-sm font-medium text-[var(--color-text-primary)] ${ROW_FOCUS}`}
          >
            {name}
          </button>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {fieldCount} field{fieldCount !== 1 ? "s" : ""} · {persistence}
          </p>
        </div>
        {!isConfirming ? (
          <DestructiveIconButton
            label={`Delete ${name}`}
            onClick={onAskDelete}
            className="self-center justify-self-end"
          />
        ) : null}
      </div>

      {isConfirming && (
        <div className="mt-2 space-y-2" role="group" aria-label={`Confirm delete ${name}`}>
          <p className="text-xs text-[var(--color-text-secondary)]" aria-live="polite">
            Delete {name}? This cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className={`rounded-md bg-[var(--color-status-error)] px-2.5 py-1 text-xs font-medium text-[var(--color-surface)] disabled:opacity-50 ${ROW_FOCUS}`}
            >
              {isDeleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              disabled={isDeleting}
              className={`rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 ${ROW_FOCUS}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
