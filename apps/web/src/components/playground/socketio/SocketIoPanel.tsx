"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { RequestCard } from "@/components/playground/shared/RequestCard";
import { SOCKETIO_EMIT_PRESETS, SOCKETIO_PRESETS } from "@/components/playground/shared/presets";
import { EventLog } from "@/components/playground/shared/EventLog";
import {
  PLAYGROUND_PANEL_STACK,
  PLAYGROUND_PANEL_STACK_CONTROLS,
  PLAYGROUND_PANEL_STACK_LOG,
} from "@/components/playground/shared/panel-layout";
import { useSocketIoConsole } from "@/hooks/use-socketio-console";
import { getSocketIoBaseUrl } from "@/lib/playground-env";
import { EmitComposer } from "@/components/playground/socketio/EmitComposer";
import { NamespaceBar } from "@/components/playground/socketio/NamespaceBar";
import { useSendShortcut } from "@/components/playground/hooks/use-send-shortcut";

const tickerPreset = SOCKETIO_PRESETS.find((p) => p.id === "sio-ticker") ?? SOCKETIO_PRESETS[0];

function sioEmptyHint(presetId: string | undefined): string {
  if (presetId === "sio-notifications") {
    return "Waiting for the first alert — usually a few seconds.";
  }
  if (presetId === "sio-ticker") {
    return "Waiting for the first tick…";
  }
  return "Connect, then emit or wait for server events.";
}

export function SocketIoPanel() {
  const [baseUrl, setBaseUrl] = useState(() =>
    tickerPreset ? tickerPreset.baseUrl : getSocketIoBaseUrl(),
  );
  const [namespace, setNamespace] = useState(() => tickerPreset?.namespace ?? "/ticker");
  const [listenEvent, setListenEvent] = useState(() => tickerPreset?.event ?? "tick");
  const [emitEvent, setEmitEvent] = useState("");
  const [emitPayload, setEmitPayload] = useState("");
  const [emitError, setEmitError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState(() => tickerPreset?.id ?? "sio-ticker");
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedPreset = SOCKETIO_PRESETS.find((preset) => preset.id === selectedPresetId);

  const emitPresets = useMemo(
    () =>
      SOCKETIO_EMIT_PRESETS.filter((preset) => preset.forEndpointIds.includes(selectedPresetId)),
    [selectedPresetId],
  );

  const consoleOpts = useMemo(
    () => ({ url: baseUrl, namespace, listenEvent }),
    [baseUrl, namespace, listenEvent],
  );

  const { status, events, connect, disconnect, emit, clear } = useSocketIoConsole(consoleOpts);

  const onPresetSelect = useCallback((preset: (typeof SOCKETIO_PRESETS)[number]) => {
    setBaseUrl(preset.baseUrl);
    setNamespace(preset.namespace);
    setListenEvent(preset.event);
    setSelectedPresetId(preset.id);
    setEmitError(null);
  }, []);

  const onEmitPresetSelect = useCallback((preset: (typeof SOCKETIO_EMIT_PRESETS)[number]) => {
    setEmitEvent(preset.event);
    setEmitPayload(preset.payload);
    setEmitError(null);
  }, []);

  const canEmit = status === "connected";

  const handleEmit = useCallback(() => {
    setEmitError(null);
    const ok = emit(emitEvent, emitPayload);
    if (!ok) {
      setEmitError("Payload must be valid JSON or empty.");
    }
  }, [emit, emitEvent, emitPayload]);

  const acceptsOutbound = selectedPreset?.acceptsOutbound === true;
  useSendShortcut(handleEmit, acceptsOutbound && canEmit && emitEvent.trim().length > 0, panelRef);

  const outboundTabs = acceptsOutbound
    ? [
        {
          id: "message",
          label: "Message",
          content: (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {emitPresets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">
                    Sample messages
                  </span>
                  <PresetPicker
                    presets={emitPresets}
                    onSelect={onEmitPresetSelect}
                    ariaLabel="Socket.IO emit presets"
                    density="inline"
                  />
                </div>
              ) : null}
              <EmitComposer
                eventName={emitEvent}
                payloadJson={emitPayload}
                canEmit={canEmit}
                emitError={emitError}
                onEventNameChange={setEmitEvent}
                onPayloadChange={setEmitPayload}
                onEmit={handleEmit}
              />
            </div>
          ),
        },
      ]
    : [];

  return (
    <div ref={panelRef} className="flex h-full min-h-0 flex-col">
      <div className={PLAYGROUND_PANEL_STACK}>
        <div className={PLAYGROUND_PANEL_STACK_CONTROLS}>
          <RequestCard
            variant="workbench"
            examplesLabel="Scenario"
            subtitle={selectedPreset?.description}
            presets={
              <PresetPicker
                presets={SOCKETIO_PRESETS}
                onSelect={onPresetSelect}
                selectedId={selectedPresetId}
                ariaLabel="Socket.IO example presets"
                density="inline"
              />
            }
            requestBar={
              <NamespaceBar
                baseUrl={baseUrl}
                namespace={namespace}
                listenEvent={listenEvent}
                status={status}
                onConnect={connect}
                onDisconnect={disconnect}
              />
            }
            tabs={outboundTabs}
          />
        </div>

        <div className={PLAYGROUND_PANEL_STACK_LOG}>
          <EventLog events={events} onClear={clear} emptyHint={sioEmptyHint(selectedPresetId)} />
        </div>
      </div>
    </div>
  );
}
