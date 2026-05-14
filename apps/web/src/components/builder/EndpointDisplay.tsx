"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api-client";

interface Props {
  endpoint: string;
}

export function EndpointDisplay({ endpoint }: Props) {
  const [copied, setCopied] = useState(false);

  const fullUrl = `${API_BASE}${endpoint}`;

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
      <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
        Schema saved! Your endpoint is ready:
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded bg-white/50 px-2 py-1 font-mono text-sm text-[var(--color-text-primary)] dark:bg-black/30 break-all">
          {fullUrl}
        </code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0 rounded-md p-1.5 text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
          aria-label="Copy endpoint URL"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
