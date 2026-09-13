"use client";

import type { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";

export interface RequestCardTab {
  readonly id: string;
  readonly label: string;
  readonly content: ReactNode;
}

export interface RequestCardProps {
  /** Muted subtitle shown under the (optional) title — typically endpoint/protocol info */
  readonly subtitle?: ReactNode;
  /** "Examples" preset row (a PresetPicker), rendered above the request bar */
  readonly presets: ReactNode;
  /** Label above the preset row */
  readonly examplesLabel?: string;
  /** Method/URL bar, connection bar, etc. */
  readonly requestBar: ReactNode;
  /** Tab strip below the request bar — REST: Headers/Body, GraphQL: Query/Variables, WS/SIO: Message */
  readonly tabs: readonly RequestCardTab[];
}

const TAB_TRIGGER_CLASS =
  "shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] " +
  "transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset " +
  "data-[state=active]:border-[var(--color-accent)] data-[state=active]:text-[var(--color-text-primary)]";

/**
 * Composes the request-side card shared by all four protocol panels: an
 * "Examples" preset row, the protocol-specific request bar, and a tab strip
 * for the remaining inputs (headers/body, query/variables, message).
 */
export function RequestCard({
  subtitle,
  presets,
  requestBar,
  tabs,
  examplesLabel = "Examples",
}: RequestCardProps) {
  const defaultTabId = tabs[0]?.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          {examplesLabel}
        </span>
        {presets}
        {subtitle ? (
          <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>
        ) : null}
      </div>

      {requestBar}

      {tabs.length > 0 && defaultTabId ? (
        <Tabs.Root
          defaultValue={defaultTabId}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
        >
          <Tabs.List className="flex shrink-0 gap-1 border-b border-[var(--color-border)]">
            {tabs.map((tab) => (
              <Tabs.Trigger key={tab.id} value={tab.id} className={TAB_TRIGGER_CLASS}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {tabs.map((tab) => (
            // forceMount + `hidden` (rather than Radix's default unmount-when-inactive)
            // keeps every tab's inputs (and validity state) alive across tab switches —
            // mirroring how Playground.tsx keeps all four protocol panels mounted.
            <Tabs.Content
              key={tab.id}
              value={tab.id}
              forceMount
              className="flex min-h-0 flex-1 flex-col overflow-auto focus-visible:outline-none data-[state=inactive]:hidden"
            >
              {tab.content}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      ) : null}
    </div>
  );
}
