"use client";

import { useCallback, useMemo, useState } from "react";
import { EndpointInfo } from "@/components/playground/shared/EndpointInfo";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import {
  SOCKETIO_EMIT_PRESETS,
  SOCKETIO_NAMESPACE_INFO,
  SOCKETIO_PRESETS,
} from "@/components/playground/shared/presets";
import { EventLog } from "@/components/playground/shared/EventLog";
import {
  PLAYGROUND_PANEL_GRID,
  PLAYGROUND_PANEL_LEFT,
  PLAYGROUND_PANEL_RIGHT,
} from "@/components/playground/shared/panel-layout";
import { useSocketIoConsole } from "@/hooks/use-socketio-console";
import { getSocketIoBaseUrl } from "@/lib/playground-env";
import { EmitComposer } from "@/components/playground/socketio/EmitComposer";
import { NamespaceBar } from "@/components/playground/socketio/NamespaceBar";

const tickerPreset = SOCKETIO_PRESETS.find((p) => p.id === "sio-ticker") ?? SOCKETIO_PRESETS[0];

export function SocketIoPanel() {
  const [baseUrl, setBaseUrl] = useState(() =>
    tickerPreset ? tickerPreset.baseUrl : getSocketIoBaseUrl(),
  );
  const [namespace, setNamespace] = useState(() => tickerPreset?.namespace ?? "/ticker");
  const [listenEvent, setListenEvent] = useState(() => tickerPreset?.event ?? "tick");
  const [emitEvent, setEmitEvent] = useState("");
  const [emitPayload, setEmitPayload] = useState("");
  const [emitError, setEmitError] = useState<string | null>(null);

  const consoleOpts = useMemo(
    () => ({ url: baseUrl, namespace, listenEvent }),
    [baseUrl, namespace, listenEvent],
  );

  const { status, events, connect, disconnect, emit } = useSocketIoConsole(consoleOpts);

  const namespaceInfo =
    SOCKETIO_NAMESPACE_INFO[namespace] ??
    "Connect and listen on the configured event to see incoming payloads.";

  const onPresetSelect = useCallback((preset: (typeof SOCKETIO_PRESETS)[number]) => {
    setBaseUrl(preset.baseUrl);
    setNamespace(preset.namespace);
    setListenEvent(preset.event);
    setEmitError(null);
  }, []);

  const onEmitPresetSelect = useCallback((preset: (typeof SOCKETIO_EMIT_PRESETS)[number]) => {
    setEmitEvent(preset.event);
    setEmitPayload(preset.payload);
    setEmitError(null);
  }, []);

  const canEmit = status === "connected";

  function handleEmit() {
    setEmitError(null);
    const ok = emit(emitEvent, emitPayload);
    if (!ok) {
      setEmitError("Payload must be valid JSON or empty.");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <PresetPicker
          presets={SOCKETIO_PRESETS}
          onSelect={onPresetSelect}
          ariaLabel="Socket.IO example presets"
        />
      </div>

      <div className={PLAYGROUND_PANEL_GRID}>
        <div className={PLAYGROUND_PANEL_LEFT}>
          <NamespaceBar
            baseUrl={baseUrl}
            namespace={namespace}
            listenEvent={listenEvent}
            status={status}
            onBaseUrlChange={setBaseUrl}
            onNamespaceChange={setNamespace}
            onListenEventChange={setListenEvent}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <EndpointInfo description={namespaceInfo} />
          <PresetPicker
            presets={SOCKETIO_EMIT_PRESETS}
            onSelect={onEmitPresetSelect}
            ariaLabel="Socket.IO emit presets"
          />
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

        <div className={PLAYGROUND_PANEL_RIGHT}>
          <EventLog events={events} emptyHint="Connect and subscribe to see events in this log." />
        </div>
      </div>
    </div>
  );
}
