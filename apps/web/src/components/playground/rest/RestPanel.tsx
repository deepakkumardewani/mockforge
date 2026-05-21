"use client";

import { useCallback, useEffect, useState } from "react";
import type { HttpMethod } from "@/components/playground/shared/presets";
import { REST_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import type { HeaderRow } from "@/components/playground/rest/HeadersEditor";
import { createEmptyHeaderRow, HeadersEditor } from "@/components/playground/rest/HeadersEditor";
import { BodyEditor } from "@/components/playground/rest/BodyEditor";
import { MethodUrlBar } from "@/components/playground/rest/MethodUrlBar";
import { SearchHints } from "@/components/playground/rest/SearchHints";
import { ResponseViewer } from "@/components/playground/shared/ResponseViewer";
import { useMfId } from "@/hooks/use-mf-id";
import type { RestRequestInput } from "@/hooks/use-rest-request";
import { useRestRequest } from "@/hooks/use-rest-request";

function headersFromRows(rows: HeaderRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  rows.forEach((r) => {
    const key = r.key.trim();
    if (!key) return;
    map[key] = r.value;
  });
  return map;
}

export function RestPanel() {
  const mfId = useMfId();
  const { send, isLoading, response, error } = useRestRequest(mfId);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>(() => [createEmptyHeaderRow()]);
  const [body, setBody] = useState("");
  const [bodyValid, setBodyValid] = useState(true);

  const onPresetSelect = useCallback((preset: (typeof REST_PRESETS)[number]) => {
    setMethod(preset.method);
    // Ensure URL always stored with /api/ prefix for consistency with autocomplete
    setUrl(preset.url.startsWith("/api/") ? preset.url : `/api/${preset.url.replace(/^\//, "")}`);
    setBody(preset.body ?? "");
    setBodyValid(true);
    setHeaderRows([createEmptyHeaderRow()]);
  }, []);

  useEffect(() => {
    const preset = REST_PRESETS.find((p) => p.url === url.trim());
    if (preset && preset.method !== method) {
      setMethod(preset.method);
    }
  }, [url, method]);

  async function handleSend() {
    if (!bodyValid) return;

    try {
      const input: RestRequestInput = {
        method,
        url,
        headers: headersFromRows(headerRows),
        body,
      };
      await send(input);
    } catch {
      /* useRestRequest surfaces error via mutation */
    }
  }

  const isSearchUrl = url.includes("/search");

  const appendParam = useCallback((key: string, value: string) => {
    setUrl((prev) => {
      const [base, queryStr = ""] = prev.split("?");
      const params = new URLSearchParams(queryStr);
      if (params.has(key)) return prev;
      params.set(key, value);
      return `${base}?${params.toString()}`;
    });
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <PresetPicker
          presets={REST_PRESETS}
          onSelect={onPresetSelect}
          ariaLabel="REST example presets"
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-2 lg:grid-rows-1 lg:items-stretch lg:gap-8 lg:overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
          <MethodUrlBar
            method={method}
            url={url}
            onMethodChange={setMethod}
            onUrlChange={setUrl}
            onSend={handleSend}
            isLoading={isLoading}
            canSend={bodyValid && url.trim().length > 0}
          />
          {isSearchUrl && <SearchHints url={url} onAppendParam={appendParam} />}
          <HeadersEditor rows={headerRows} onChange={setHeaderRows} />
          <BodyEditor value={body} onChange={setBody} onValidityChange={setBodyValid} />
        </div>

        <div className="min-h-0 min-w-0">
          <ResponseViewer response={response} transportError={error} />
        </div>
      </div>
    </div>
  );
}
