"use client";

import type { ConnectionState } from "@/components/playground/shared/StatusPill";

export interface ConnectionControlsProps {
  readonly status: ConnectionState;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
}

const MOLTEN_BTN =
  "rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-on-accent)] outline-none transition-opacity hover:opacity-90";

const GHOST_BTN =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] outline-none transition-colors hover:bg-[var(--color-surface-hover)]";

function connectionAction(status: ConnectionState) {
  if (status === "error") return { label: "Retry", molten: true, connect: true };
  if (status === "connecting") return { label: "Cancel", molten: false, connect: false };
  if (status === "connected") return { label: "Disconnect", molten: false, connect: false };
  return { label: "Connect", molten: true, connect: true };
}

/** Single Connect / Retry / Cancel / Disconnect toggle. Status lives in the bar LiveDot. */
export function ConnectionControls({ status, onConnect, onDisconnect }: ConnectionControlsProps) {
  const action = connectionAction(status);
  return (
    <button
      type="button"
      onClick={action.connect ? onConnect : onDisconnect}
      className={action.molten ? MOLTEN_BTN : GHOST_BTN}
    >
      {action.label}
    </button>
  );
}
