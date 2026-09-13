"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ProtocolRail } from "@/components/playground/ProtocolRail";
import { GraphqlPanel } from "@/components/playground/graphql/GraphqlPanel";
import { RestPanel } from "@/components/playground/rest/RestPanel";
import { SocketIoPanel } from "@/components/playground/socketio/SocketIoPanel";
import { WsPanel } from "@/components/playground/ws/WsPanel";
import type { Protocol } from "@/components/playground/shared/protocol";

const PANEL_CONTENT_CLASS = "flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none";
const PROTOCOL_QUERY_PARAM = "protocol";
const DEFAULT_PROTOCOL: Protocol = "rest";
const KNOWN_PROTOCOLS: readonly Protocol[] = ["rest", "graphql", "websocket", "socketio"];

function isProtocol(value: string | null): value is Protocol {
  return KNOWN_PROTOCOLS.includes(value as Protocol);
}

export function Playground() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedProtocol = searchParams.get(PROTOCOL_QUERY_PARAM);
  const protocol = isProtocol(requestedProtocol) ? requestedProtocol : DEFAULT_PROTOCOL;

  const setProtocol = useCallback(
    (next: Protocol) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(PROTOCOL_QUERY_PARAM, next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const panelVisibility = useMemo(
    () =>
      KNOWN_PROTOCOLS.reduce<Record<Protocol, boolean>>(
        (acc, value) => {
          acc[value] = value === protocol;
          return acc;
        },
        {} as Record<Protocol, boolean>,
      ),
    [protocol],
  );

  return (
    <main className="playground-scope flex h-screen max-w-[100vw] flex-col overflow-hidden lg:flex-row">
      <ProtocolRail active={protocol} onChange={setProtocol} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 pt-4 lg:px-5">
        <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
          <div
            hidden={!panelVisibility.rest}
            aria-hidden={!panelVisibility.rest}
            className={PANEL_CONTENT_CLASS}
          >
            <RestPanel />
          </div>
          <div
            hidden={!panelVisibility.graphql}
            aria-hidden={!panelVisibility.graphql}
            className={PANEL_CONTENT_CLASS}
          >
            <GraphqlPanel />
          </div>
          <div
            hidden={!panelVisibility.websocket}
            aria-hidden={!panelVisibility.websocket}
            className={PANEL_CONTENT_CLASS}
          >
            <WsPanel />
          </div>
          <div
            hidden={!panelVisibility.socketio}
            aria-hidden={!panelVisibility.socketio}
            className={PANEL_CONTENT_CLASS}
          >
            <SocketIoPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
