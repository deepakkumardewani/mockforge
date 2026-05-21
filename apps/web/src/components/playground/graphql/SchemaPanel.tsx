"use client";

import { useMemo, useState } from "react";
import { Accordion } from "@/components/playground/shared/Accordion";
import {
  buildOperation,
  getGraphqlRootFieldsByKind,
  type GraphqlRootField,
} from "@/components/playground/graphql/build-operation";

export type SchemaPanelProps = {
  onConfirm: (operation: string) => void;
};

function RootFieldSection({
  field,
  isActive,
  selectedScalars,
  onActivate,
  onToggleScalar,
}: {
  field: GraphqlRootField;
  isActive: boolean;
  selectedScalars: ReadonlySet<string>;
  onActivate: () => void;
  onToggleScalar: (scalar: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={() => {
          setExpanded((prev) => !prev);
          onActivate();
        }}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-mono text-xs text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset"
        aria-expanded={expanded}
      >
        <span>{field.name}</span>
        <span className="text-[var(--color-text-muted)]">{field.type}</span>
      </button>
      {expanded && (
        <div className="space-y-2 border-t border-[var(--color-border)] px-3 py-2">
          {field.selectableScalars.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">No sub-fields — inserts call only.</p>
          ) : (
            field.selectableScalars.map((scalar) => (
              <label
                key={scalar}
                className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-primary)]"
              >
                <input
                  type="checkbox"
                  checked={isActive && selectedScalars.has(scalar)}
                  onChange={() => onToggleScalar(scalar)}
                  className="rounded border-[var(--color-border)]"
                />
                <span className="font-mono">{scalar}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FieldGroup({
  title,
  fields,
  activeField,
  selectedScalars,
  onActivate,
  onToggleScalar,
}: {
  title: string;
  fields: GraphqlRootField[];
  activeField: string | null;
  selectedScalars: ReadonlySet<string>;
  onActivate: (name: string) => void;
  onToggleScalar: (scalar: string) => void;
}) {
  return (
    <Accordion title={title} badge={fields.length}>
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {fields.map((field) => (
          <RootFieldSection
            key={field.name}
            field={field}
            isActive={activeField === field.name}
            selectedScalars={selectedScalars}
            onActivate={() => onActivate(field.name)}
            onToggleScalar={onToggleScalar}
          />
        ))}
      </div>
    </Accordion>
  );
}

export function SchemaPanel({ onConfirm }: SchemaPanelProps) {
  const { query, mutation } = useMemo(() => getGraphqlRootFieldsByKind(), []);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [selectedScalars, setSelectedScalars] = useState<Set<string>>(new Set());

  function activateField(name: string) {
    setActiveField(name);
    setSelectedScalars(new Set());
  }

  function toggleScalar(scalar: string) {
    if (!activeField) return;
    setSelectedScalars((prev) => {
      const next = new Set(prev);
      if (next.has(scalar)) next.delete(scalar);
      else next.add(scalar);
      return next;
    });
  }

  const built = activeField ? buildOperation(activeField, [...selectedScalars]) : null;

  return (
    <aside
      className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3"
      aria-label="GraphQL schema"
    >
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Schema</h3>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        <FieldGroup
          title="Query"
          fields={query}
          activeField={activeField}
          selectedScalars={selectedScalars}
          onActivate={activateField}
          onToggleScalar={toggleScalar}
        />
        <FieldGroup
          title="Mutation"
          fields={mutation}
          activeField={activeField}
          selectedScalars={selectedScalars}
          onActivate={activateField}
          onToggleScalar={toggleScalar}
        />
      </div>
      <button
        type="button"
        disabled={!built}
        onClick={() => built && onConfirm(built)}
        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        Insert operation
      </button>
    </aside>
  );
}
