"use client";

import type { Protocol } from "@/components/playground/shared/protocol";

type ProtocolOption = {
  value: Protocol;
  label: string;
  short: string;
};

const PROTOCOLS: ProtocolOption[] = [
  { value: "rest", label: "REST", short: "REST" },
  { value: "graphql", label: "GraphQL", short: "GQL" },
  { value: "websocket", label: "WebSocket", short: "WS" },
  { value: "socketio", label: "Socket.IO", short: "SIO" },
];

export type ProtocolRailProps = {
  active: Protocol;
  onChange: (p: Protocol) => void;
};

export function ProtocolRail({ active, onChange }: ProtocolRailProps) {
  return (
    <nav
      aria-label="Protocol selector"
      className="flex shrink-0 items-center gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2
                 lg:flex-col lg:items-center lg:border-b-0 lg:border-r lg:px-0 lg:py-4 lg:w-[52px]"
    >
      {PROTOCOLS.map(({ value, label, short }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          title={label}
          aria-label={label}
          aria-pressed={active === value}
          className={`flex h-11 w-11 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
            active === value
              ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {short}
        </button>
      ))}
    </nav>
  );
}
