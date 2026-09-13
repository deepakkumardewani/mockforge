"use client";

import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { ConnectionUrlBar } from "@/components/playground/shared/ConnectionUrlBar";

export interface NamespaceBarProps {
  readonly baseUrl: string;
  readonly namespace: string;
  readonly listenEvent: string;
  readonly status: WsConnectionStatus;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
}

function socketIoTarget(baseUrl: string, namespace: string): string {
  const origin = baseUrl.trim().replace(/\/+$/, "");
  const ns = namespace.trim();
  const path = ns.startsWith("/") ? ns : `/${ns}`;
  return `${origin}${path}`;
}

export function NamespaceBar({
  baseUrl,
  namespace,
  listenEvent,
  status,
  onConnect,
  onDisconnect,
}: NamespaceBarProps) {
  return (
    <ConnectionUrlBar
      url={socketIoTarget(baseUrl, namespace)}
      meta={`Listening for “${listenEvent}”`}
      status={status}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
    />
  );
}
