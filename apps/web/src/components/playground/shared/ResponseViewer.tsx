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
      className="flex h-full min-h-[12rem] min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="HTTP response"
    >
      {!response ? (
        <p className="flex flex-1 text-sm text-[var(--color-text-muted)]">
          Send a request to see the response
        </p>
      ) : (
        <>
          <h2 className="shrink-0 text-base font-bold text-[var(--color-text-primary)]">
            Response
          </h2>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <StatusPill httpStatus={response.status} />
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              {response.timeMs}&nbsp;ms
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">{response.statusText}</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="mb-2 shrink-0 text-sm font-semibold text-[var(--color-text-primary)]">
              Body
            </h3>
            {response.body !== null ? (
              <div className="min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable] rounded-lg">
                <JsonView value={response.body} maxHeightClassName="" />
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Empty body</p>
            )}
          </div>

          <details className="group shrink-0">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]">
              Response headers
            </summary>
            <JsonView value={response.headers} maxHeightClassName="max-h-40 mt-2" />
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
