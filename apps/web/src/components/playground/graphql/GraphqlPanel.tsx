"use client";

import { useCallback, useState } from "react";
import { GRAPHQL_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { ResponseViewer } from "@/components/playground/rest/ResponseViewer";
import { QueryEditor } from "@/components/playground/graphql/QueryEditor";
import { VariablesEditor } from "@/components/playground/graphql/VariablesEditor";
import { useMfId } from "@/hooks/use-mf-id";
import type { GraphqlRequestInput } from "@/hooks/use-graphql-request";
import { PLAYGROUND_GRAPHQL_URL, useGraphqlRequest } from "@/hooks/use-graphql-request";
import { GraphqlRequestBar } from "@/components/playground/graphql/GraphqlRequestBar";

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

  const canSend = variablesValid && query.trim().length > 0;

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
    <div className="flex min-w-0 flex-col gap-6">
      <PresetPicker
        presets={GRAPHQL_PRESETS}
        onSelect={onPresetSelect}
        ariaLabel="GraphQL example presets"
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-4">
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

        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <ResponseViewer response={response} transportError={error} />
        </div>
      </div>
    </div>
  );
}
