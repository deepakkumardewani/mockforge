"use client";

import { useCallback, useState } from "react";
import { WS_PRESETS } from "@/components/playground/shared/presets";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { ConnectionBar } from "@/components/playground/ws/ConnectionBar";
import { MessageComposer } from "@/components/playground/ws/MessageComposer";
import { EventLog } from "@/components/playground/ws/EventLog";
import { useWsConsole } from "@/hooks/use-ws-console";

export function WsPanel() {
  const [url, setUrl] = useState("");
  const [outgoing, setOutgoing] = useState("");
  const { status, events, connect, disconnect, send } = useWsConsole(url);

  const onPresetSelect = useCallback((preset: (typeof WS_PRESETS)[number]) => {
    setUrl(preset.url);
  }, []);

  function handleSend() {
    const text = outgoing.trim();
    if (!text) return;
    send(text);
    setOutgoing("");
  }

  const canSend = status === "connected";

  return (
    <div className="flex min-h-0 flex-col gap-8">
      <PresetPicker
        presets={WS_PRESETS}
        onSelect={onPresetSelect}
        ariaLabel="WebSocket example presets"
      />

      <div className="flex min-h-0 flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10">
        <div className="flex min-h-0 min-w-0 flex-col gap-5">
          <ConnectionBar
            url={url}
            onUrlChange={setUrl}
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

        <div className="flex min-h-0 min-w-0 flex-col lg:sticky lg:top-6 lg:self-stretch">
          <EventLog events={events} emptyHint="Connect and stream messages to populate this log." />
        </div>
      </div>
    </div>
  );
}
