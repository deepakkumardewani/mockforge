"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { RequestCard } from "@/components/playground/shared/RequestCard";
import { WS_MESSAGE_PRESETS, WS_PRESETS } from "@/components/playground/shared/presets";
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
import { useSendShortcut } from "@/components/playground/hooks/use-send-shortcut";

const DEFAULT_WS_PRESET_ID = "ws-ticker";

function wsEmptyHint(presetId: string | undefined): string {
  if (presetId === "ws-notifications") {
    return "Waiting for the first alert — usually a few seconds.";
  }
  if (presetId === "ws-ticker") {
    return "Waiting for the first tick…";
  }
  return "Connect to start the stream. Events appear here.";
}

export function WsPanel() {
  const [url, setUrl] = useState(PLAYGROUND_WS_URL);
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_WS_PRESET_ID);
  const [outgoing, setOutgoing] = useState("");
  const { status, events, connect, disconnect, send, clear } = useWsConsole(url);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedPreset = WS_PRESETS.find((preset) => preset.id === selectedPresetId);

  const messagePresets = useMemo(
    () => WS_MESSAGE_PRESETS.filter((preset) => preset.forEndpointIds.includes(selectedPresetId)),
    [selectedPresetId],
  );

  const onEndpointPresetSelect = useCallback((preset: (typeof WS_PRESETS)[number]) => {
    setUrl(preset.url);
    setSelectedPresetId(preset.id);
  }, []);

  const onMessagePresetSelect = useCallback((preset: (typeof WS_MESSAGE_PRESETS)[number]) => {
    setOutgoing(preset.message);
  }, []);

  const handleSend = useCallback(() => {
    const text = outgoing.trim();
    if (!text) return;
    send(text);
    setOutgoing("");
  }, [outgoing, send]);

  const canSend = status === "connected";
  const acceptsOutbound = selectedPreset?.acceptsOutbound === true;
  useSendShortcut(handleSend, acceptsOutbound && canSend && outgoing.trim().length > 0, panelRef);

  const outboundTabs = acceptsOutbound
    ? [
        {
          id: "message",
          label: "Message",
          content: (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {messagePresets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">
                    Sample messages
                  </span>
                  <PresetPicker
                    presets={messagePresets}
                    onSelect={onMessagePresetSelect}
                    ariaLabel="WebSocket message presets"
                  />
                </div>
              ) : null}
              <MessageComposer
                value={outgoing}
                onChange={setOutgoing}
                onSend={handleSend}
                canSend={canSend}
              />
            </div>
          ),
        },
      ]
    : [];

  return (
    <div ref={panelRef} className="flex h-full min-h-0 flex-col gap-4">
      <div className={PLAYGROUND_PANEL_GRID}>
        <div className={PLAYGROUND_PANEL_LEFT}>
          <RequestCard
            examplesLabel="Scenario"
            subtitle={selectedPreset?.description}
            presets={
              <PresetPicker
                presets={WS_PRESETS}
                onSelect={onEndpointPresetSelect}
                selectedId={selectedPresetId}
                ariaLabel="WebSocket endpoint presets"
              />
            }
            requestBar={
              <ConnectionBar
                endpointUrl={url}
                status={status}
                onConnect={connect}
                onDisconnect={disconnect}
              />
            }
            tabs={outboundTabs}
          />
        </div>

        <div className={PLAYGROUND_PANEL_RIGHT}>
          <EventLog events={events} onClear={clear} emptyHint={wsEmptyHint(selectedPresetId)} />
        </div>
      </div>
    </div>
  );
}
