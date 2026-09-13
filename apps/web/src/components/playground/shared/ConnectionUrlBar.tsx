"use client";

import type { ReactNode } from "react";
import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { ConnectionControls } from "@/components/playground/shared/ConnectionControls";
import { ConnectionLiveDot } from "@/components/playground/shared/StatusPill";

export interface ConnectionUrlBarProps {
  readonly url: string;
  readonly status: WsConnectionStatus;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
  /** Optional muted line under the URL (e.g. Socket.IO listen event). */
  readonly meta?: ReactNode;
}

/**
 * REST-style connection group: labelled URL is the primary object,
 * Live + Connect stay shrink-wrapped on the trailing edge.
 */
export function ConnectionUrlBar({
  url,
  status,
  onConnect,
  onDisconnect,
  meta,
}: ConnectionUrlBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        Connect to
      </span>
      <div className="flex flex-col gap-3 border-y border-[var(--color-border)] py-3 sm:flex-row sm:items-center">
        <div data-url-field className="flex min-w-0 flex-1 flex-col justify-center">
          <p
            title={url}
            className="break-all font-mono text-sm leading-snug text-[var(--color-text-primary)]"
          >
            {url}
          </p>
          {meta ? (
            <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)]">{meta}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <ConnectionLiveDot state={status} />
          <ConnectionControls status={status} onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      </div>
    </div>
  );
}
