"use client";

import { Cable, Globe, type LucideIcon, Share2, Zap } from "lucide-react";
import { Tooltip } from "@/components/playground/shared/Tooltip";
import type { Protocol } from "@/components/playground/shared/protocol";

type ProtocolOption = {
  value: Protocol;
  label: string;
  short: string;
  icon: LucideIcon;
};

const PROTOCOLS: ProtocolOption[] = [
  { value: "rest", label: "REST", short: "REST", icon: Globe },
  { value: "graphql", label: "GraphQL", short: "GQL", icon: Share2 },
  { value: "websocket", label: "WebSocket", short: "WS", icon: Cable },
  { value: "socketio", label: "Socket.IO", short: "SIO", icon: Zap },
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
      {PROTOCOLS.map(({ value, label, short, icon: Icon }) => {
        const isActive = active === value;
        return (
          <Tooltip key={value} label={label}>
            <button
              type="button"
              onClick={() => onChange(value)}
              aria-label={label}
              aria-pressed={isActive}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isActive
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {short}
            </button>
          </Tooltip>
        );
      })}
    </nav>
  );
}
