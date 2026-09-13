"use client";

import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { DEFAULT_ENGINE_IO_PATH } from "@/hooks/use-socketio-console";
import { ConnectionControls } from "@/components/playground/shared/ConnectionControls";
import { ConnectionLiveDot } from "@/components/playground/shared/StatusPill";

export interface NamespaceBarProps {
  readonly baseUrl: string;
  readonly namespace: string;
  readonly listenEvent: string;
  readonly status: WsConnectionStatus;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
  /** Engine.IO handshake path. Defaults to `/socket.io`. */
  readonly enginePath?: string;
}

function Detail({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        {label}
      </span>
      <p className="break-all font-mono text-sm leading-snug text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

export function NamespaceBar({
  baseUrl,
  namespace,
  listenEvent,
  status,
  onConnect,
  onDisconnect,
  enginePath = DEFAULT_ENGINE_IO_PATH,
}: NamespaceBarProps) {
  const origin = baseUrl.trim().replace(/\/+$/, "");
  const ns = namespace.trim().startsWith("/") ? namespace.trim() : `/${namespace.trim()}`;
  const path = enginePath.trim() || DEFAULT_ENGINE_IO_PATH;
  const endpoint = `${origin}${ns}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 border-y border-[var(--color-border)] py-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Connect to
          </span>
          <p
            title={endpoint}
            className="truncate font-mono text-sm text-[var(--color-text-primary)]"
          >
            {endpoint}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Listening for “{listenEvent}”
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <ConnectionLiveDot state={status} />
          <ConnectionControls status={status} onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          Connection details
        </summary>
        <div className="mt-2 grid gap-3 border-t border-[var(--color-border)] pt-3 sm:grid-cols-3">
          <Detail label="Server origin" value={origin} />
          <Detail label="Namespace" value={ns} />
          <Detail label="Engine.IO path" value={path} />
        </div>
      </details>
    </div>
  );
}
