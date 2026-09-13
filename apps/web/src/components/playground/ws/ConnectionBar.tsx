"use client";

import type { WsConnectionStatus } from "@/hooks/use-ws-console";
import { ConnectionUrlBar } from "@/components/playground/shared/ConnectionUrlBar";

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
  return (
    <ConnectionUrlBar
      url={endpointUrl}
      status={status}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
    />
  );
}
