"use client";

import { useCallback, useState } from "react";
import type { HttpMethod } from "@/components/playground/shared/presets";
import { REST_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import type { HeaderRow } from "@/components/playground/rest/HeadersEditor";
import { createEmptyHeaderRow, HeadersEditor } from "@/components/playground/rest/HeadersEditor";
import { BodyEditor } from "@/components/playground/rest/BodyEditor";
import { MethodUrlBar } from "@/components/playground/rest/MethodUrlBar";
import { ResponseViewer } from "@/components/playground/rest/ResponseViewer";
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
    setUrl(preset.url);
    setBody(preset.body ?? "");
    setBodyValid(true);
    setHeaderRows([createEmptyHeaderRow()]);
  }, []);

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

  return (
    <div className="flex flex-col gap-6">
      <PresetPicker
        presets={REST_PRESETS}
        onSelect={onPresetSelect}
        ariaLabel="REST example presets"
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <MethodUrlBar
            method={method}
            url={url}
            onMethodChange={setMethod}
            onUrlChange={setUrl}
            onSend={handleSend}
            isLoading={isLoading}
            canSend={bodyValid && url.trim().length > 0}
          />
          <HeadersEditor rows={headerRows} onChange={setHeaderRows} />
          <BodyEditor value={body} onChange={setBody} onValidityChange={setBodyValid} />
        </div>

        <div className="min-w-0">
          <ResponseViewer response={response} transportError={error} />
        </div>
      </div>
    </div>
  );
}
