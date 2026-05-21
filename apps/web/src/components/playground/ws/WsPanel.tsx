"use client";

import { useState } from "react";
import { ConnectionBar } from "@/components/playground/ws/ConnectionBar";
import { MessageComposer } from "@/components/playground/ws/MessageComposer";
import { EventLog } from "@/components/playground/shared/EventLog";
import { PLAYGROUND_WS_URL } from "@/components/playground/ws/playground-ws-url";
import { useWsConsole } from "@/hooks/use-ws-console";

export function WsPanel() {
  const [outgoing, setOutgoing] = useState("");
  const { status, events, connect, disconnect, send } = useWsConsole(PLAYGROUND_WS_URL);

  function handleSend() {
    const text = outgoing.trim();
    if (!text) return;
    send(text);
    setOutgoing("");
  }

  const canSend = status === "connected";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-2 lg:grid-rows-1 lg:items-stretch lg:gap-8 lg:overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
          <ConnectionBar
            endpointUrl={PLAYGROUND_WS_URL}
            status={status}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <MessageComposer
            value={outgoing}
            onChange={setOutgoing}
            onSend={handleSend}
            canSend={canSend}
          />
        </div>

        <div className="min-h-0 min-w-0">
          <EventLog events={events} emptyHint="Connect and stream messages to populate this log." />
        </div>
      </div>
    </div>
  );
}
