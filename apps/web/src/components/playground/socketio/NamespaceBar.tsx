"use client";

import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { StatusPill } from "@/components/playground/shared/StatusPill";

export interface NamespaceBarProps {
  readonly baseUrl: string;
  readonly namespace: string;
  readonly listenEvent: string;
  readonly status: WsConnectionStatus;
  readonly onBaseUrlChange: (value: string) => void;
  readonly onNamespaceChange: (value: string) => void;
  readonly onListenEventChange: (value: string) => void;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
}

export function NamespaceBar({
  baseUrl,
  namespace,
  listenEvent,
  status,
  onBaseUrlChange,
  onNamespaceChange,
  onListenEventChange,
  onConnect,
  onDisconnect,
}: NamespaceBarProps) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const fieldsDisabled = isConnected || isConnecting;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Base URL</span>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            disabled={fieldsDisabled}
            autoComplete="off"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="http://localhost:4001"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Namespace</span>
          <input
            type="text"
            value={namespace}
            onChange={(e) => onNamespaceChange(e.target.value)}
            disabled={fieldsDisabled}
            autoComplete="off"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="/ticker"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Listen for event
          </span>
          <input
            type="text"
            value={listenEvent}
            onChange={(e) => onListenEventChange(e.target.value)}
            disabled={fieldsDisabled}
            autoComplete="off"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="tick"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3">
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
