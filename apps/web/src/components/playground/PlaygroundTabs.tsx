"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { GraphqlPanel } from "@/components/playground/graphql/GraphqlPanel";
import { RestPanel } from "@/components/playground/rest/RestPanel";
import { SocketIoPanel } from "@/components/playground/socketio/SocketIoPanel";
import { WsPanel } from "@/components/playground/ws/WsPanel";

const TRIGGER_CLASS =
  "rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] outline-none transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[var(--color-surface)] data-[state=active]:text-[var(--color-accent)]";

export function PlaygroundTabs() {
  return (
    <Tabs.Root defaultValue="rest" className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Tabs.List
        aria-label="Protocol"
        className="flex w-full min-w-0 shrink-0 flex-wrap gap-1 border-b border-[var(--color-border)] pb-px"
      >
        <Tabs.Trigger value="rest" className={TRIGGER_CLASS}>
          REST
        </Tabs.Trigger>
        <Tabs.Trigger value="graphql" className={TRIGGER_CLASS}>
          GraphQL
        </Tabs.Trigger>
        <Tabs.Trigger value="websocket" className={TRIGGER_CLASS}>
          WebSocket
        </Tabs.Trigger>
        <Tabs.Trigger value="socketio" className={TRIGGER_CLASS}>
          Socket.IO
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="rest" tabIndex={0} className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none">
        <RestPanel />
      </Tabs.Content>
      <Tabs.Content value="graphql" tabIndex={0} className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none">
        <GraphqlPanel />
      </Tabs.Content>
      <Tabs.Content value="websocket" tabIndex={0} className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none">
        <WsPanel />
      </Tabs.Content>
      <Tabs.Content value="socketio" tabIndex={0} className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none">
        <SocketIoPanel />
      </Tabs.Content>
    </Tabs.Root>
  );
}
