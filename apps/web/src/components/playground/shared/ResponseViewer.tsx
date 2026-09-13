"use client";

import { useState } from "react";
import { HttpStatusPill } from "@/components/playground/shared/StatusPill";
import { JsonView } from "@/components/playground/shared/JsonView";
import type { HttpResponseData } from "@/components/playground/hooks/timed-fetch";
import { buildCurl } from "@/components/playground/rest/build-curl";

const BYTES_PER_KILOBYTE = 1024;
const COPY_CONFIRMATION_MS = 1500;

/** Optional REST request context, needed only to build a "Copy as curl" command. */
export interface ResponseViewerRestRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body?: string;
}

export interface ResponseViewerProps {
  response: HttpResponseData | null;
  /** Network / runtime failure (not HTTP 4xx/5xx payloads) */
  transportError?: string | null;
  /** Present only for REST panels; enables the "Copy as curl" action. */
  restRequest?: ResponseViewerRestRequest;
}

function formatByteSize(byteLength: number): string {
  if (byteLength < BYTES_PER_KILOBYTE) return `${byteLength} B`;
  return `${(byteLength / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
}

function responseByteSize(response: HttpResponseData): number {
  const bodyText =
    typeof response.body === "string" ? response.body : JSON.stringify(response.body ?? "");
  return new Blob([bodyText]).size;
}

/** Copies text to the clipboard, surfacing failures rather than swallowing them. */
async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

interface CopyButtonProps {
  readonly label: string;
  readonly getText: () => string;
}

function CopyButton({ label, getText }: CopyButtonProps) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  async function handleClick() {
    setCopyError(null);
    try {
      await copyToClipboard(getText());
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), COPY_CONFIRMATION_MS);
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Copy failed");
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] outline-none transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        {justCopied ? "Copied" : label}
      </button>
      {copyError ? (
        <span role="alert" className="text-[10px] text-[var(--color-status-error)]">
          {copyError}
        </span>
      ) : null}
    </span>
  );
}

function EmptyResponseState() {
  return (
    <div className="flex flex-1 flex-col items-start gap-3">
      <p className="text-sm text-[var(--color-text-muted)]">Send a request to see the response</p>
    </div>
  );
}

function ResponseHeaderRow({
  response,
  restRequest,
}: {
  response: HttpResponseData;
  restRequest?: ResponseViewerRestRequest;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3">
      <HttpStatusPill httpStatus={response.status} />
      <span className="font-mono text-xs text-[var(--color-text-muted)]">
        {response.timeMs}&nbsp;ms
      </span>
      <span className="font-mono text-xs text-[var(--color-text-muted)]">
        {formatByteSize(responseByteSize(response))}
      </span>
      <span className="text-xs text-[var(--color-text-muted)]">{response.statusText}</span>
      <span className="ml-auto flex items-center gap-1.5">
        <CopyButton label="Copy JSON" getText={() => JSON.stringify(response.body, null, 2)} />
        {restRequest ? (
          <CopyButton label="Copy as curl" getText={() => buildCurl(restRequest)} />
        ) : null}
      </span>
    </div>
  );
}

export function ResponseViewer({ response, transportError, restRequest }: ResponseViewerProps) {
  return (
    <section
      className="flex h-full min-h-[12rem] min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      aria-label="HTTP response"
    >
      {!response ? (
        <EmptyResponseState />
      ) : (
        <>
          <h2 className="shrink-0 text-base font-bold text-[var(--color-text-primary)]">
            Response
          </h2>

          <ResponseHeaderRow response={response} restRequest={restRequest} />

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
