"use client";

import { useState } from "react";

interface Props {
  mfId: string;
  onDismiss: () => void;
}

export function MfIdPrompt({ mfId, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Your browser ID</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Save this ID to restore your schemas on another device.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-[var(--color-surface-raised)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)]">
              {mfId}
            </code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(mfId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
