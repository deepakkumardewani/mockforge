"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api-client";

export interface EndpointDisplayProps {
  endpoint: string;
}

const COPY_MS = 2000;
const SAMPLE_QUERY = "limit=5&skip=0";

function toAbsoluteUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${API_BASE}${endpoint}`;
}

function sampleCurl(absoluteUrl: string): string {
  return `curl "${absoluteUrl}?${SAMPLE_QUERY}"`;
}

export function EndpointDisplay({ endpoint }: EndpointDisplayProps) {
  const fullUrl = toAbsoluteUrl(endpoint);
  const curlExample = sampleCurl(fullUrl);

  return (
    <section className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
            03 · Use
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-[var(--color-text-primary)]">
            Endpoint ready
          </h2>
        </div>
        <span className="rounded-full bg-[var(--color-surface-hover)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-accent)]">
          GET
        </span>
      </div>

      <CopyRow
        value={fullUrl}
        display={fullUrl}
        copyLabel="Copy endpoint URL"
        copiedLabel="Endpoint URL copied"
      />

      <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
        Anyone with this URL can request fresh generated records. Shape the response with{" "}
        <code className="font-mono text-[var(--color-text-secondary)]">limit</code>,{" "}
        <code className="font-mono text-[var(--color-text-secondary)]">skip</code>, and other
        supported query parameters.
      </p>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
          Sample request
        </p>
        <CopyRow
          value={curlExample}
          display={curlExample}
          copyLabel="Copy curl example"
          copiedLabel="Curl example copied"
          codeSurface
        />
      </div>
    </section>
  );
}

interface CopyRowProps {
  value: string;
  display: string;
  copyLabel: string;
  copiedLabel: string;
  codeSurface?: boolean;
}

function CopyRow({ value, display, copyLabel, copiedLabel, codeSurface }: CopyRowProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy failed");
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <code
          className={`min-w-0 flex-1 break-all rounded-md px-2 py-1.5 font-mono text-sm ${
            codeSurface
              ? "bg-[var(--color-code-bg)] text-[var(--color-code-text)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-primary)]"
          }`}
        >
          {display}
        </code>
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          aria-label={copied ? copiedLabel : copyLabel}
          className="shrink-0 rounded-md border border-[var(--color-border)] px-2 py-1.5 text-xs font-medium text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </p>
      {error && (
        <p role="alert" aria-live="assertive" className="text-xs text-[var(--color-status-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
