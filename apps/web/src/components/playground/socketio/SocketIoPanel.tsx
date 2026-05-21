"use client";

import { useCallback, useMemo, useState } from "react";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { SOCKETIO_PRESETS } from "@/components/playground/shared/presets";
import { EventLog } from "@/components/playground/shared/EventLog";
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

  const onPresetSelect = useCallback((preset: (typeof SOCKETIO_PRESETS)[number]) => {
    setBaseUrl(preset.baseUrl);
    setNamespace(preset.namespace);
    setListenEvent(preset.event);
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

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-2 lg:grid-rows-1 lg:items-stretch lg:gap-8 lg:overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
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

        <div className="min-h-0 min-w-0">
          <EventLog events={events} emptyHint="Connect and subscribe to see events in this log." />
        </div>
      </div>
    </div>
  );
}
