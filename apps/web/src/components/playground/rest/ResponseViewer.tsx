"use client";

import { StatusPill } from "@/components/playground/shared/StatusPill";
import { JsonView } from "@/components/playground/shared/JsonView";
import type { RestResponseData } from "@/hooks/use-rest-request";

export interface ResponseViewerProps {
  response: RestResponseData | null;
  /** Network / runtime failure (not HTTP 4xx/5xx payloads) */
  transportError?: string | null;
}

export function ResponseViewer({ response, transportError }: ResponseViewerProps) {
  return (
    <section
      className="flex min-h-[12rem] min-w-0 flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="HTTP response"
    >
      {!response ? (
        <p className="text-sm text-[var(--color-text-muted)]">Send a request to see the response</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill httpStatus={response.status} />
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              {response.timeMs}&nbsp;ms
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">{response.statusText}</span>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Body</h3>
            {response.body !== null ? (
              <JsonView value={response.body} maxHeightClassName="max-h-[28rem]" />
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Empty body</p>
            )}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]">
              Response headers
            </summary>
            <JsonView value={response.headers} maxHeightClassName="max-h-48 mt-2" />
          </details>
        </>
      )}

      {transportError ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-accent)]" role="alert">
          {transportError}
        </p>
      ) : null}
    </section>
  );
}
