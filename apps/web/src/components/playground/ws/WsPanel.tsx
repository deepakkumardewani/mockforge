"use client";

import { useCallback, useState } from "react";
import { EndpointInfo } from "@/components/playground/shared/EndpointInfo";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import {
  WS_MESSAGE_PRESETS,
  WS_TICKER_ENDPOINT_INFO,
} from "@/components/playground/shared/presets";
import { ConnectionBar } from "@/components/playground/ws/ConnectionBar";
import { MessageComposer } from "@/components/playground/ws/MessageComposer";
import { EventLog } from "@/components/playground/shared/EventLog";
import {
  PLAYGROUND_PANEL_GRID,
  PLAYGROUND_PANEL_LEFT,
  PLAYGROUND_PANEL_RIGHT,
} from "@/components/playground/shared/panel-layout";
import { PLAYGROUND_WS_URL } from "@/components/playground/ws/playground-ws-url";
import { useWsConsole } from "@/hooks/use-ws-console";

export function WsPanel() {
  const [outgoing, setOutgoing] = useState("");
  const { status, events, connect, disconnect, send } = useWsConsole(PLAYGROUND_WS_URL);

  const onMessagePresetSelect = useCallback((preset: (typeof WS_MESSAGE_PRESETS)[number]) => {
    setOutgoing(preset.message);
  }, []);

  function handleSend() {
    const text = outgoing.trim();
    if (!text) return;
    send(text);
    setOutgoing("");
  }

  const canSend = status === "connected";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className={PLAYGROUND_PANEL_GRID}>
        <div className={PLAYGROUND_PANEL_LEFT}>
          <ConnectionBar
            endpointUrl={PLAYGROUND_WS_URL}
            status={status}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <EndpointInfo description={WS_TICKER_ENDPOINT_INFO} />
          <PresetPicker
            presets={WS_MESSAGE_PRESETS}
            onSelect={onMessagePresetSelect}
            ariaLabel="WebSocket message presets"
          />
          <MessageComposer
            value={outgoing}
            onChange={setOutgoing}
            onSend={handleSend}
            canSend={canSend}
          />
        </div>

        <div className={PLAYGROUND_PANEL_RIGHT}>
          <EventLog events={events} emptyHint="Connect and stream messages to populate this log." />
        </div>
      </div>
    </div>
  );
}
