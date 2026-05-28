"use client";

import {
  getDefaultScalarsForField,
  getGraphqlRootFieldsByKind,
  type GraphqlRootField,
} from "@/components/playground/graphql/build-operation";

export type SchemaPanelProps = {
  onSelect: (rootField: string, selectedFields: readonly string[]) => void;
};

function FieldRow({
  field,
  onSelect,
}: {
  field: GraphqlRootField;
  onSelect: SchemaPanelProps["onSelect"];
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(field.name, getDefaultScalarsForField(field.name))}
      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-[var(--color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset"
    >
      <span className="text-[var(--color-text-primary)]">{field.name}</span>
      <span className="truncate text-[var(--color-text-muted)]">{field.type}</span>
    </button>
  );
}

function FieldGroup({
  title,
  fields,
  onSelect,
}: {
  title: string;
  fields: GraphqlRootField[];
  onSelect: SchemaPanelProps["onSelect"];
}) {
  return (
    <div>
      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {title}
      </p>
      {fields.map((field) => (
        <FieldRow key={field.name} field={field} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function SchemaPanel({ onSelect }: SchemaPanelProps) {
  const { query, mutation } = getGraphqlRootFieldsByKind();

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
      aria-label="GraphQL schema"
    >
      <div className="shrink-0 border-b border-[var(--color-border)] px-3 py-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Schema</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <FieldGroup title="Query" fields={query} onSelect={onSelect} />
        <FieldGroup title="Mutation" fields={mutation} onSelect={onSelect} />
      </div>
    </section>
  );
}
