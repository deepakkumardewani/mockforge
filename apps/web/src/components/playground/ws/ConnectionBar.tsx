"use client";

import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { StatusPill } from "@/components/playground/shared/StatusPill";

export interface ConnectionBarProps {
  readonly url: string;
  readonly onUrlChange: (url: string) => void;
  readonly status: WsConnectionStatus;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
}

export function ConnectionBar({
  url,
  onUrlChange,
  status,
  onConnect,
  onDisconnect,
}: ConnectionBarProps) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2">
      <input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="ws://localhost:4000/ws/ticker"
        aria-label="WebSocket URL"
        disabled={isConnected || isConnecting}
        className="min-w-[12rem] flex-1 rounded-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill connectionState={status === "error" ? "error" : status} />
        <button
          type="button"
          onClick={onConnect}
          disabled={isConnected || isConnecting || url.trim().length === 0}
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
