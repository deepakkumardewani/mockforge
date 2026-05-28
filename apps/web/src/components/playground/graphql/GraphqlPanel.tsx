"use client";

import { useCallback, useState } from "react";
import { GRAPHQL_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { ResponseViewer } from "@/components/playground/shared/ResponseViewer";
import {
  GRAPHQL_PANEL_GRID,
  PLAYGROUND_PANEL_GRID,
  PLAYGROUND_PANEL_LEFT,
  PLAYGROUND_PANEL_RIGHT,
} from "@/components/playground/shared/panel-layout";
import { QueryEditor } from "@/components/playground/graphql/QueryEditor";
import { VariablesEditor } from "@/components/playground/graphql/VariablesEditor";
import { useMfId } from "@/hooks/use-mf-id";
import type { GraphqlRequestInput } from "@/hooks/use-graphql-request";
import { PLAYGROUND_GRAPHQL_URL, useGraphqlRequest } from "@/hooks/use-graphql-request";
import { GraphqlRequestBar } from "@/components/playground/graphql/GraphqlRequestBar";
import { mergeOperation } from "@/components/playground/graphql/build-operation";
import { SchemaPanel } from "@/components/playground/graphql/SchemaPanel";

const SCHEMA_SIDEBAR_KEY = "mf_schema_sidebar_open";

function readSidebarState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SCHEMA_SIDEBAR_KEY) === "true";
}

export function GraphqlPanel() {
  const mfId = useMfId();
  const { send, isLoading, response, error } = useGraphqlRequest(mfId);
  const [query, setQuery] = useState("");
  const [variables, setVariables] = useState("");
  const [variablesValid, setVariablesValid] = useState(true);
  const [schemaOpen, setSchemaOpen] = useState(readSidebarState);

  const toggleSchema = useCallback(() => {
    setSchemaOpen((prev) => {
      const next = !prev;
      localStorage.setItem(SCHEMA_SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  const onPresetSelect = useCallback((preset: (typeof GRAPHQL_PRESETS)[number]) => {
    setQuery(preset.query);
    setVariables(preset.variables ?? "");
    setVariablesValid(true);
  }, []);

  const canSend = variablesValid && query.trim().length > 0;

  const applySchemaSelection = useCallback(
    (rootField: string, selectedFields: readonly string[]) => {
      setQuery((prev) => mergeOperation(prev, rootField, selectedFields) ?? prev);
    },
    [],
  );

  async function handleSend() {
    if (!canSend) return;
    try {
      const input: GraphqlRequestInput = {
        query: query.trim(),
        variablesJson: variables,
      };
      await send(input);
    } catch {
      /* useGraphqlRequest surfaces error via mutation */
    }
  }

  const gridClass = schemaOpen ? GRAPHQL_PANEL_GRID : PLAYGROUND_PANEL_GRID;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <PresetPicker
          presets={GRAPHQL_PRESETS}
          onSelect={onPresetSelect}
          ariaLabel="GraphQL example presets"
        />
        <button
          type="button"
          onClick={toggleSchema}
          aria-pressed={schemaOpen}
          aria-label="Toggle schema sidebar"
          title={schemaOpen ? "Hide schema" : "Show schema"}
          className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
            schemaOpen
              ? "border-[var(--color-accent)] bg-[var(--color-surface-raised)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
          }`}
        >
          {schemaOpen ? "«" : "»"}
        </button>
      </div>

      <div className={gridClass}>
        {schemaOpen && (
          <div className={PLAYGROUND_PANEL_LEFT}>
            <SchemaPanel onSelect={applySchemaSelection} />
          </div>
        )}
        <div className={PLAYGROUND_PANEL_LEFT}>
          <GraphqlRequestBar
            endpointUrl={PLAYGROUND_GRAPHQL_URL}
            onSend={handleSend}
            isLoading={isLoading}
            canSend={canSend}
          />
          <QueryEditor value={query} onChange={setQuery} />
          <VariablesEditor
            value={variables}
            onChange={setVariables}
            onValidityChange={setVariablesValid}
          />
        </div>

        <div className={PLAYGROUND_PANEL_RIGHT}>
          <ResponseViewer response={response} transportError={error} />
        </div>
      </div>
    </div>
  );
}
