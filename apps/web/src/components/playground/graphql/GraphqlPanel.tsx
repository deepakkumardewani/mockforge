"use client";

import { useCallback, useState } from "react";
import { GRAPHQL_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { ResponseViewer } from "@/components/playground/rest/ResponseViewer";
import { QueryEditor } from "@/components/playground/graphql/QueryEditor";
import { VariablesEditor } from "@/components/playground/graphql/VariablesEditor";
import { useMfId } from "@/hooks/use-mf-id";
import type { GraphqlRequestInput } from "@/hooks/use-graphql-request";
import { useGraphqlRequest } from "@/hooks/use-graphql-request";

export function GraphqlPanel() {
  const mfId = useMfId();
  const { send, isLoading, response, error } = useGraphqlRequest(mfId);
  const [query, setQuery] = useState("");
  const [variables, setVariables] = useState("");
  const [variablesValid, setVariablesValid] = useState(true);

  const onPresetSelect = useCallback((preset: (typeof GRAPHQL_PRESETS)[number]) => {
    setQuery(preset.query);
    setVariables(preset.variables ?? "");
    setVariablesValid(true);
  }, []);

  const canSend =
    variablesValid && query.trim().length > 0;

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

  return (
    <div className="flex flex-col gap-6">
      <PresetPicker
        presets={GRAPHQL_PRESETS}
        onSelect={onPresetSelect}
        ariaLabel="GraphQL example presets"
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-stretch justify-end gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !canSend}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--color-accent)" }}
            >
              {isLoading ? "Sending…" : "Send"}
            </button>
          </div>
          <QueryEditor value={query} onChange={setQuery} />
          <VariablesEditor
            value={variables}
            onChange={setVariables}
            onValidityChange={setVariablesValid}
          />
        </div>

        <div className="min-w-0">
          <ResponseViewer response={response} transportError={error} />
        </div>
      </div>
    </div>
  );
}
