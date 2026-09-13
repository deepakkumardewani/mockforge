"use client";

import { useCallback, useRef, useState } from "react";
import { GRAPHQL_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { RequestCard } from "@/components/playground/shared/RequestCard";
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
import { SCHEMA_SIDEBAR_STORAGE_KEY } from "@/lib/playground-constants";
import { useSendShortcut } from "@/components/playground/hooks/use-send-shortcut";

function readSidebarState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SCHEMA_SIDEBAR_STORAGE_KEY) === "true";
}

export function GraphqlPanel() {
  const mfId = useMfId();
  const { send, isLoading, response, error } = useGraphqlRequest(mfId);
  const [query, setQuery] = useState("");
  const [variables, setVariables] = useState("");
  const [variablesValid, setVariablesValid] = useState(true);
  const [schemaOpen, setSchemaOpen] = useState(readSidebarState);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleSchema = useCallback(() => {
    setSchemaOpen((prev) => {
      const next = !prev;
      localStorage.setItem(SCHEMA_SIDEBAR_STORAGE_KEY, String(next));
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

  const handleSend = useCallback(async () => {
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
  }, [canSend, query, variables, send]);

  useSendShortcut(handleSend, canSend && !isLoading, panelRef);

  const gridClass = schemaOpen ? GRAPHQL_PANEL_GRID : PLAYGROUND_PANEL_GRID;

  return (
    <div ref={panelRef} className="flex h-full min-h-0 flex-col gap-4">
      <div className={gridClass}>
        {schemaOpen && (
          <div className={PLAYGROUND_PANEL_LEFT}>
            <SchemaPanel onSelect={applySchemaSelection} />
          </div>
        )}
        <div className={PLAYGROUND_PANEL_LEFT}>
          <RequestCard
            presets={
              <PresetPicker
                presets={GRAPHQL_PRESETS}
                onSelect={onPresetSelect}
                ariaLabel="GraphQL example presets"
              />
            }
            requestBar={
              <GraphqlRequestBar
                endpointUrl={PLAYGROUND_GRAPHQL_URL}
                onSend={handleSend}
                isLoading={isLoading}
                canSend={canSend}
                schemaOpen={schemaOpen}
                onToggleSchema={toggleSchema}
              />
            }
            tabs={[
              {
                id: "query",
                label: "Query",
                content: (
                  <QueryEditor
                    value={query}
                    onChange={setQuery}
                    onSubmit={canSend ? handleSend : undefined}
                  />
                ),
              },
              {
                id: "variables",
                label: "Variables",
                content: (
                  <VariablesEditor
                    value={variables}
                    onChange={setVariables}
                    onValidityChange={setVariablesValid}
                    onSubmit={canSend ? handleSend : undefined}
                  />
                ),
              },
            ]}
          />
        </div>

        <div className={PLAYGROUND_PANEL_RIGHT}>
          <ResponseViewer response={response} transportError={error} />
        </div>
      </div>
    </div>
  );
}
