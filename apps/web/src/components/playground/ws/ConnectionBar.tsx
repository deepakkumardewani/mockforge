"use client";

import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { StatusPill } from "@/components/playground/shared/StatusPill";

export interface ConnectionBarProps {
  readonly endpointUrl: string;
  readonly status: WsConnectionStatus;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
}

export function ConnectionBar({
  endpointUrl,
  status,
  onConnect,
  onDisconnect,
}: ConnectionBarProps) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p
          className="truncate rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)]"
          title={endpointUrl}
        >
          {endpointUrl}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <StatusPill connectionState={status === "error" ? "error" : status} />
        <button
          type="button"
          onClick={onConnect}
          disabled={isConnected || isConnecting}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-on-accent)] outline-none transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isConnecting ? "Connecting…" : "Connect"}
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          disabled={!isConnected && !isConnecting && status !== "error"}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] outline-none transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
