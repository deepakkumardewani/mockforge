"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useMfIdStore } from "@/store/mf-id";
import type { SavedSchema } from "./types";

interface Props {
  onLoad: (schema: SavedSchema) => void;
  activeSlug: string | null;
}

export function SavedSchemas({ onLoad, activeSlug }: Props) {
  const mfId = useMfIdStore((s) => s.mfId);
  const queryClient = useQueryClient();

  const { data: schemas = [], isLoading } = useQuery({
    queryKey: ["saved-schemas", mfId],
    queryFn: () =>
      apiClient<{ data: SavedSchema[] }>("/api/schemas", {}, mfId).then(
        (res) => res.data,
      ),
    enabled: !!mfId,
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) =>
      apiClient<{ deleted: boolean }>(
        `/api/schemas/${slug}`,
        { method: "DELETE" },
        mfId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-schemas", mfId] });
    },
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
        Saved Schemas
      </h3>

      {isLoading && (
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      )}

      {!isLoading && schemas.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">
          No saved schemas yet.
        </p>
      )}

      {schemas.map((schema) => (
        <div
          key={schema.slug}
          className={`flex items-center justify-between rounded-lg border p-3 transition-colors cursor-pointer ${
            activeSlug === schema.slug
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
              : "border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-accent)]/50"
          }`}
          onClick={() => onLoad(schema)}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {schema.definition.name}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {schema.definition.fields.length} field
              {schema.definition.fields.length !== 1 ? "s" : ""}
              {schema.persistent ? " · persistent" : " · ephemeral"}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(schema.slug);
            }}
            className="shrink-0 rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors"
            aria-label={`Delete ${schema.definition.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
