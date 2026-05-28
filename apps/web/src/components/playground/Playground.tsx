"use client";

import { useState } from "react";
import { ProtocolRail } from "@/components/playground/ProtocolRail";
import { GraphqlPanel } from "@/components/playground/graphql/GraphqlPanel";
import { RestPanel } from "@/components/playground/rest/RestPanel";
import { SocketIoPanel } from "@/components/playground/socketio/SocketIoPanel";
import { WsPanel } from "@/components/playground/ws/WsPanel";
import type { Protocol } from "@/components/playground/shared/protocol";

const PANEL_CONTENT_CLASS = "flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none";

export function Playground() {
  const [protocol, setProtocol] = useState<Protocol>("rest");

  return (
    <main className="playground-scope flex h-screen max-w-[100vw] flex-col overflow-hidden lg:flex-row">
      <ProtocolRail active={protocol} onChange={setProtocol} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col overflow-hidden">
          <div className={PANEL_CONTENT_CLASS}>
            {protocol === "rest" && <RestPanel />}
            {protocol === "graphql" && <GraphqlPanel />}
            {protocol === "websocket" && <WsPanel />}
            {protocol === "socketio" && <SocketIoPanel />}
          </div>
        </div>
      </div>
    </main>
  );
}
